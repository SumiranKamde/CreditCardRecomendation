// Database seed — loads prisma/verified-catalogue.template.json (currently 30
// cards) instead of the 5 illustrative cards in seed.ts.
// ---------------------------------------------------------------------------
// ⚠️  This file is NOT yet production-ready data, even though the fees/income/
//     reward-rate figures have been checked against real sources (see the
//     `_correction` / `_note` fields inside the JSON for what was fixed and
//     why). Every card's `imageUrl` and `applyUrl` are still placeholders —
//     real Cloudinary assets and affiliate tracking links are a Phase 3
//     business step (sign up with an affiliate network) that hasn't happened
//     yet. Running this script gives you a realistic-looking, numerically
//     accurate local/dev catalogue — it does NOT satisfy `catalogue:check`
//     and must not be promoted to production as-is.
//
// Modeling reminders (must match src/scoring.ts):
//   • rewardRate is a FRACTION: 0.05 = 5% back.
//   • minIncome is ANNUAL ₹.
//   • maxCap is a MONTHLY ₹ cap on reward value (applied before ×12); null = uncapped.
//   • Every card has an "Other" rule — the base/fallback rate.
//
// Run: npm run seed:verified   (requires DATABASE_URL and `npm run db:push` first)
// ---------------------------------------------------------------------------

// Load .env FIRST: this is a standalone entry point (not booted via server.ts),
// so it must populate DATABASE_URL before ../src/db.ts constructs PrismaClient.
import "dotenv/config";
import { readFile } from "node:fs/promises";
import { prisma } from "../src/db.ts";

interface CatalogueMultiplier {
  category: string;
  rewardRate: number;
  maxCap: number | null;
}

interface CatalogueCard {
  cardName: string;
  bankName: string;
  sourceUrl?: string | null;
  lastVerifiedAt?: string | null;
  annualFee: number;
  minIncome: number;
  applyUrl: string;
  imageUrl: string;
  multipliers: CatalogueMultiplier[];
  _note?: string;
  _correction?: string;
}

const CATALOGUE_PATH = new URL("./verified-catalogue.template.json", import.meta.url);

function isPlaceholderUrl(value: string): boolean {
  return /example\.com|placehold\.co|placeholder|cloudinary\.com\/demo\//i.test(value);
}

async function loadCatalogue(): Promise<CatalogueCard[]> {
  const raw = await readFile(CATALOGUE_PATH, "utf8");
  const parsed = JSON.parse(raw) as { cards?: CatalogueCard[] };
  const cards = parsed.cards ?? [];
  if (cards.length === 0) {
    throw new Error("verified-catalogue.template.json has no cards — nothing to seed.");
  }

  // Minimal structural sanity check. Full field-level validation (placeholder
  // URLs, duplicate multipliers, etc.) lives in validate-catalogue.ts — run
  // `npm run catalogue:check` for that. This seed intentionally still allows
  // placeholder images/apply URLs through, since they're expected at this
  // stage of the project (see the file header above).
  for (const [index, card] of cards.entries()) {
    const label = `cards[${index}] ${card.bankName ?? "?"} ${card.cardName ?? "?"}`;
    if (!card.cardName || !card.bankName) throw new Error(`${label}: cardName/bankName missing.`);
    if (typeof card.annualFee !== "number" || typeof card.minIncome !== "number") {
      throw new Error(`${label}: annualFee/minIncome must be numbers.`);
    }
    const hasOtherRule = card.multipliers?.some(
      (rule) => rule.category.trim().toLowerCase() === "other",
    );
    if (!hasOtherRule) throw new Error(`${label}: missing a required "Other" fallback rule.`);
  }

  return cards;
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Refusing to seed the verified-catalogue template in production — it still contains " +
        "placeholder images/apply URLs. Run `npm run catalogue:check` and complete Phase 3 " +
        "(real Cloudinary assets + affiliate links) before any production seed.",
    );
  }

  const cards = await loadCatalogue();
  const placeholderCount = cards.filter(
    (c) => isPlaceholderUrl(c.imageUrl) || isPlaceholderUrl(c.applyUrl),
  ).length;

  console.log(`Seeding ${cards.length} cards from verified-catalogue.template.json…`);
  if (placeholderCount > 0) {
    console.log(
      `  ⚠ ${placeholderCount} card(s) still have placeholder image/apply URLs ` +
        `(expected pre-Phase-3 — fees/income/rates are the corrected values, images/links are not).`,
    );
  }

  // Idempotent: clear existing rows first. Deleting cards cascades to
  // card_multipliers (onDelete: Cascade in the schema).
  const deleted = await prisma.card.deleteMany();
  if (deleted.count > 0) console.log(`  cleared ${deleted.count} existing card(s)`);

  for (const c of cards) {
    await prisma.card.create({
      data: {
        bankName: c.bankName,
        cardName: c.cardName,
        annualFee: c.annualFee,
        minIncome: c.minIncome,
        imageUrl: c.imageUrl,
        applyUrl: c.applyUrl,
        multipliers: {
          create: c.multipliers.map((m) => ({
            category: m.category,
            rewardRate: m.rewardRate,
            maxCap: m.maxCap,
          })),
        },
      },
    });
    console.log(`  + ${c.bankName} — ${c.cardName}`);
  }

  const total = await prisma.card.count();
  console.log(`Done. ${total} cards in the catalogue.`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
