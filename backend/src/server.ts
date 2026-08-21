// Express bootstrap for the Credit Card Recommender API (Phase 1).
// ---------------------------------------------------------------------------
// `import "dotenv/config"` MUST stay first: it populates process.env before any
// other import runs, and ../db.ts constructs PrismaClient (which reads
// DATABASE_URL) at import time.
// ---------------------------------------------------------------------------

import "dotenv/config";

import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { recommendationsRouter } from "./routes/recommendations.ts";

const app = express();

// One reverse-proxy hop in front (Render/Railway/etc.) so express-rate-limit
// keys off the real client IP from X-Forwarded-For, not the proxy's address.
app.set("trust proxy", 1);

// Fall back to 4000 if PORT is unset or not a usable number (NaN is falsy).
const PORT = Number(process.env.PORT) || 4000;

// CORS_ORIGIN is "*" (dev) or a comma-separated allowlist (locked down before deploy).
const corsOriginEnv = process.env.CORS_ORIGIN?.trim() || "*";
const corsOptions: CorsOptions =
  corsOriginEnv === "*"
    ? { origin: "*" }
    : { origin: corsOriginEnv.split(",").map((o) => o.trim()).filter(Boolean) };

app.use(cors(corsOptions));

// Security headers (safe defaults for a JSON API).
app.use(helmet());

// Bodies are tiny (3 fields); cap the size so a giant payload can't tie us up.
app.use(express.json({ limit: "16kb" }));

// Per-IP rate limit for the recommendation endpoint. /health stays unthrottled
// (health checks poll it) because the limiter is mounted only on the API route.
const apiLimiter = rateLimit({
  windowMs: 60_000, // 1 minute
  limit: 60, // 60 requests per IP per window
  standardHeaders: true, // send RateLimit-* headers
  legacyHeaders: false, // drop the deprecated X-RateLimit-* headers
  message: { error: "Too many requests. Please slow down and try again shortly." },
});

// Liveness probe (used by Render/Railway health checks).
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api/recommendations", apiLimiter, recommendationsRouter);

// 404 for anything unmatched.
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found." });
});

/** body-parser raises HttpErrors (malformed JSON, payload too large, bad
 *  charset, …) carrying a numeric 4xx `status`. Pull it out so we return the
 *  correct client-error code instead of masking every one as a 500. */
function clientErrorStatus(err: unknown): number | null {
  if (err && typeof err === "object") {
    const e = err as { status?: unknown; statusCode?: unknown };
    const s =
      typeof e.status === "number"
        ? e.status
        : typeof e.statusCode === "number"
          ? e.statusCode
          : null;
    if (s !== null && s >= 400 && s < 500) return s;
  }
  return null;
}

// Central error handler. Known client errors return their real status with a
// safe message (malformed JSON → 400, oversized body → 413, …); anything
// unexpected is a 500, with details logged server-side and never leaked.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status = clientErrorStatus(err);
  if (status !== null) {
    const type = (err as { type?: string }).type;
    const message =
      type === "entity.too.large"
        ? "Request body too large (max 16kb)."
        : type === "entity.parse.failed"
          ? "Malformed JSON in request body."
          : "Bad request.";
    res.status(status).json({ error: message });
    return;
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`CCR API listening on http://localhost:${PORT}`);
});
