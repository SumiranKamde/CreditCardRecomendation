// POST /api/recommendations
// ---------------------------------------------------------------------------
// The only write-nothing, read-only endpoint of Phase 1. It is deliberately
// ANONYMOUS and STATELESS: it accepts three numbers/strings, runs the pure
// scoring engine, and returns a sorted list. Nothing is persisted.
//
// Request body (JSON):
//   { "monthlySpend": number>=0, "topCategory": string, "annualIncome": number>=0 }
//
// Response (200):
//   { "count": number, "recommendations": ScoredCard[] }
//
// ZERO-PII MANDATE: the request is rejected (400) if it carries any PII-like
// key (name/email/phone/pan/…). See CLAUDE.md.
// ---------------------------------------------------------------------------

import { Router, type Request, type Response, type NextFunction } from "express";
import { getCatalogue } from "../catalogue.ts";
import { recommend } from "../scoring.ts";
import type { RecommendationInput } from "../types.ts";

export const recommendationsRouter: Router = Router();

/** Generous upper sanity bound (₹100 crore) to reject clearly-bogus numbers. */
const MAX_RUPEES = 1_000_000_000;

/**
 * PII gate. We only ever want the three anonymous fields; any key that looks
 * like personal data is refused outright. Short/ambiguous tokens (that could
 * appear as substrings of innocent words) are matched as WHOLE normalized keys;
 * longer, unambiguous tokens are matched as substrings.
 */
const PII_EXACT = new Set([
  "pan", "dob", "otp", "cvv", "ssn", "upi", "pin", "age", "gender", "sex",
]);
const PII_SUBSTRINGS = [
  "name", "email", "phone", "mobile", "aadhaar", "aadhar", "passport",
  "password", "cardnumber", "accountnumber", "ifsc", "address", "pincode",
  "zipcode", "dateofbirth", "father", "mother", "location", "geo",
];

/** The ONLY keys an anonymous request may carry. Anything else is refused.
 *  This is what stops PII nested inside an unexpected object/array (e.g.
 *  `{ meta: { email } }`) from slipping past the gate: the unexpected container
 *  key is rejected before we ever look inside, and the three allowed fields are
 *  all primitives (enforced below), so nothing can hide beneath them either. */
const ALLOWED_KEYS = new Set(["monthlySpend", "topCategory", "annualIncome"]);

/** lowercase + strip everything but a–z0–9 so "e-mail" / "Phone_No" normalize. */
function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Whether a key name looks like personal data (for a clearer error message). */
function looksLikePii(rawKey: string): boolean {
  const k = normalizeKey(rawKey);
  return PII_EXACT.has(k) || PII_SUBSTRINGS.some((tok) => k.includes(tok));
}

/** First key that isn't one of the three allowed fields, or null if clean. */
function findDisallowedKey(body: Record<string, unknown>): string | null {
  for (const rawKey of Object.keys(body)) {
    if (!ALLOWED_KEYS.has(rawKey)) return rawKey;
  }
  return null;
}

/** A finite, non-negative, in-range number (rejects NaN/Infinity/negatives). */
function isValidAmount(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= MAX_RUPEES
  );
}

recommendationsRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const body = req.body;

    // Body must be a plain JSON object.
    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      res.status(400).json({ error: "Request body must be a JSON object." });
      return;
    }

    // ZERO-PII: allow ONLY the three known fields. Any extra key is refused,
    // which also blocks PII nested inside an unexpected object or array.
    const badKey = findDisallowedKey(body as Record<string, unknown>);
    if (badKey) {
      res.status(400).json({
        error: looksLikePii(badKey)
          ? "This is a zero-PII service. Send only monthlySpend, topCategory, and annualIncome."
          : "Unexpected field. Send only monthlySpend, topCategory, and annualIncome.",
        offendingKey: badKey,
      });
      return;
    }

    // Validate the three required fields.
    const { monthlySpend, topCategory, annualIncome } = body as Record<string, unknown>;
    const errors: string[] = [];

    if (!isValidAmount(monthlySpend)) {
      errors.push(`monthlySpend must be a number between 0 and ${MAX_RUPEES}.`);
    }
    if (!isValidAmount(annualIncome)) {
      errors.push(`annualIncome must be a number between 0 and ${MAX_RUPEES}.`);
    }
    if (typeof topCategory !== "string" || topCategory.trim() === "") {
      errors.push("topCategory must be a non-empty string.");
    }

    if (errors.length > 0) {
      res.status(400).json({ error: "Invalid request.", details: errors });
      return;
    }

    // Build the clean, typed input the scorer expects (ignore any extra keys).
    const input: RecommendationInput = {
      monthlySpend: monthlySpend as number,
      topCategory: (topCategory as string).trim(),
      annualIncome: annualIncome as number,
    };

    try {
      const cards = await getCatalogue(); // cached; hits Neon only on a cold/expired cache
      const recommendations = recommend(cards, input);
      res.json({ count: recommendations.length, recommendations });
    } catch (err) {
      next(err); // handed to the central error handler in server.ts
    }
  },
);
