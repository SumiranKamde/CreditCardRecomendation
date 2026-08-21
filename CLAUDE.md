# CLAUDE.md — India Credit Card Recommender

Concise rules file. Read this first every session. Full plan lives in `PROJECT_PLAN.md`.

## Project Overview

A zero-PII web app that recommends Indian credit cards from anonymous behavioral
input (monthly spend, top category, annual income) and earns via affiliate links.
No accounts, no personal data. Curate the **top ~30–40 cards**, kept accurate —
do NOT try to be an exhaustive 300+ card directory.

## Repo Structure

- `backend/`  — Node.js + Express + Prisma API (Phase 1). **Current focus.**
- `frontend/` — Next.js (App Router) + React + Tailwind. **Do not create until Phase 2.**

## Stack

- Backend: Node.js (v22+), Express, TypeScript (run directly via Node's type
  stripping — no build step), Prisma ORM.
- DB: PostgreSQL on **Neon** (add `pgvector` later for the RAG feature).
- Images: Cloudinary (store URLs only).
- Imports use explicit `.ts` extensions (Node NodeNext resolution).

## Commands (run inside `backend/`)

- Install: `npm install`
- Generate Prisma client: `npm run prisma:generate`
- Create tables on Neon: `npm run db:push`   (or `npm run db:migrate` for migrations)
- Seed sample cards: `npm run seed`
- Run tests (no DB needed): `npm test`
- Dev server: `npm run dev`  → `http://localhost:4000`
- Type-check: `npm run typecheck`

## Database Structure (see `backend/prisma/schema.prisma`)

- `cards`: id (uuid), bank_name, card_name, annual_fee (₹ int), min_income
  (**annual** ₹ int), image_url, apply_url.
- `card_multipliers`: id (uuid), card_id (fk), category, reward_rate (Decimal),
  max_cap (int, nullable).

## Recommendation Algorithm (see `backend/src/scoring.ts` — already built & tested)

Endpoint contract: `POST /api/recommendations` with `{ monthlySpend, topCategory, annualIncome }`.

1. **Hard filter:** drop any card where `min_income > annualIncome`.
2. **Score** (per chosen category, falling back to the card's `"Other"` rule):
   - `monthlyReward = monthlySpend * reward_rate`
   - if `max_cap != null`: `monthlyReward = min(monthlyReward, max_cap)`  ← cap BEFORE ×12
   - `netBenefit = monthlyReward * 12 - annual_fee`
3. **Sort** by `netBenefit` descending (tie-break: lower fee, then name).

## Conventions & Rules (do not violate)

- **ZERO-PII MANDATE:** NEVER add schema fields, request params, or storage for
  names, emails, phone numbers, PAN, or bank credentials. Requests are anonymous
  and stateless. The API should reject bodies containing PII-like keys.
- **`reward_rate` is a FRACTION, not a percent number:** `0.05` means 5% back.
  `monthlyReward = monthlySpend * reward_rate`. Keep this consistent everywhere.
- **`min_income` is ANNUAL** ₹ (compared against `annualIncome`, range ~₹2L–₹20L).
- **`max_cap` is a MONTHLY** ₹ cap on reward value, applied before annualizing.
- **Category `"Other"`** is the base/everything-else rate and the fallback when a
  card has no rule for the chosen category. Seed every card with an `"Other"` rule.
- **Affiliate link security:** anywhere an `apply_url` is rendered (Phase 2
  frontend), the anchor MUST use `target="_blank" rel="noopener noreferrer"`.
- **Legal:** don't host bank logos directly (use Cloudinary / affiliate assets);
  keep affiliate disclosure + "not affiliated with banks" disclaimer site-wide.
- **Scoring logic stays pure:** all recommendation math lives in
  `src/scoring.ts` (no Express/Prisma imports) so it stays unit-testable.
  Prisma returns `Decimal` for `reward_rate` — convert to `number` in the route
  layer before calling the scorer.

## Current Status — Phase 1 COMPLETE (verified against Neon)

Done and correct — do not rewrite unless asked:
- `backend/package.json`, `tsconfig.json`, `.gitignore`, `.env.example`
- `backend/prisma/schema.prisma` (the two models above)
- `backend/src/types.ts` (shared domain types)
- `backend/src/scoring.ts` (the algorithm above)
- `backend/tests/scoring.test.ts` — **12 tests, all passing** (`npm test`)
- `backend/src/db.ts` — Prisma client singleton (cached on `globalThis` for `--watch`).
- `backend/src/routes/recommendations.ts` — `POST /api/recommendations`: strict
  allowlist gate (only the 3 fields; blocks nested PII), input validation (allows
  `monthlySpend = 0`), reads the cached catalogue, calls `recommend()`, returns
  `{ count, recommendations }`.
- `backend/src/catalogue.ts` — in-process cache of the mapped cards (5-min TTL,
  `Decimal`→`number`) so request bursts don't re-query Neon.
- `backend/src/server.ts` — Express: `helmet`, `cors` (from `CORS_ORIGIN`),
  `express.json({ limit: "16kb" })`, `express-rate-limit` (60/min/IP) on the API
  route, `GET /health`, central error handler (4xx passthrough), `PORT` (4000).
- `backend/prisma/seed.ts` — 5 illustrative Indian cards, each with an `"Other"` rule.
- `backend/README.md` — Neon setup + run commands + API examples.

**Verified end-to-end against Neon (2026-08-21):** `npm install`,
`prisma generate`, `npm run typecheck` (clean), `npm test` (12/12). Schema pushed
to Neon (`db:push`), 5 cards seeded, and the live API returns correct, sorted
recommendations — income hard-filter, `"Other"` fallback, caps, negative net
benefit, and the 1.2× approval boundary all confirmed on real data. The HTTP
layer is hardened too: PII keys → 400, bad input → 400, `monthlySpend = 0` OK,
malformed JSON → 400, unknown route → 404. Hardened with `helmet` headers, a
60 req/min/IP rate limit (`429` past that), and a 5-min in-process catalogue
cache — all verified live.

## Next Steps — Phase 2 (frontend)

Phase 1 is complete. Do NOT start Phase 2 without being asked. When you do:
scaffold `frontend/` (Next.js App Router + Tailwind), build the input controls
(income/spend sliders + category dropdown) and the results dashboard, lead with
the green "Net ₹X profit" number, show the approval indicator, and render every
"Apply Now" anchor with `target="_blank" rel="noopener noreferrer"`.

**Reminder:** the seeded card figures are illustrative test data — replace with
MITC-verified fees/rates and real affiliate links in Phase 3 before production.
