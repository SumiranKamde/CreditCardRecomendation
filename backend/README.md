# CCR Backend — India Credit Card Recommender API

Zero-PII backend for the India Credit Card Recommender. It recommends Indian
credit cards from **anonymous** behavioral input (monthly spend, top spend
category, annual income) by computing each eligible card's **Net Annual
Benefit**, and returns them sorted best-first.

- **No accounts, no personal data.** The API is stateless and rejects any
  request carrying PII-like keys (name/email/phone/PAN/…).
- **Stack:** Node.js 22+ · Express · TypeScript (run directly via Node's native
  type stripping — no build step) · Prisma ORM · PostgreSQL on Neon.

> ⚠️ The seed data is **illustrative test data only** and is not verified against
> official MITC documents. Replace it with verified figures and real affiliate
> links before production (Phase 3).

---

## Prerequisites

- **Node.js ≥ 22.6** (for native `.ts` execution and `--watch`). Check with
  `node --version`.
- A free **Neon** Postgres database — <https://console.neon.tech>.

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Generate the Prisma client from prisma/schema.prisma
npm run prisma:generate

# 3. Configure your database connection
cp .env.example .env
#    then edit .env and paste your Neon connection string into DATABASE_URL
#    (keep ?sslmode=require at the end — Neon requires SSL)

# 4. Create the tables on Neon
npm run db:push        # or: npm run db:migrate  (creates a migration history)

# 5. Load the illustrative sample cards
npm run seed

# 6. Start the dev server (auto-reloads on change)
npm run dev            # → http://localhost:4000
```

### Environment variables (`.env`)

| Variable       | Required | Default | Notes                                                        |
| -------------- | -------- | ------- | ------------------------------------------------------------ |
| `DATABASE_URL` | yes      | —       | Neon Postgres connection string (with `?sslmode=require`).   |
| `PORT`         | no       | `4000`  | Port the API listens on.                                     |
| `CORS_ORIGIN`  | no       | `*`     | `*` for local dev, or a comma-separated allowlist for deploy.|

---

## Scripts

| Command                   | What it does                                             |
| ------------------------- | -------------------------------------------------------- |
| `npm run dev`             | Start the API with `node --watch` on `PORT` (4000).      |
| `npm start`               | Start the API once (no watch).                           |
| `npm test`                | Run the scoring unit tests. **No DB or install needed.** |
| `npm run typecheck`       | `tsc --noEmit` type-check of the whole project.          |
| `npm run prisma:generate` | Generate the Prisma client.                              |
| `npm run db:push`         | Push the schema to Neon (no migration history).          |
| `npm run db:migrate`      | Create and apply a migration named `init`.               |
| `npm run seed`            | Load the 5 illustrative sample cards.                    |

---

## API

### `GET /health`

Liveness probe.

```json
{ "status": "ok" }
```

### `POST /api/recommendations`

Anonymous recommendation request. **Send only these three fields.** Any other
key is rejected with `400` — and a PII-like key (e.g. `name`, `email`, `phone`,
`pan`) gets a zero-PII-specific message. The endpoint is rate-limited to
**60 requests/min per IP** (`429` when exceeded).

**Request body**

| Field          | Type     | Rules                                            |
| -------------- | -------- | ------------------------------------------------ |
| `monthlySpend` | number   | ≥ 0 (0 is valid). Monthly spend in the category. |
| `topCategory`  | string   | e.g. `Travel`, `Fuel`, `Dining`, `Shopping`, `Online`, `Other`. Unknown categories fall back to each card's `Other` rate. |
| `annualIncome` | number   | ≥ 0. Used only for the eligibility filter.       |

**Response `200`**

```json
{
  "count": 2,
  "recommendations": [
    {
      "id": "…",
      "bankName": "Axis Bank",
      "cardName": "ACE Credit Card",
      "annualFee": 499,
      "minIncome": 300000,
      "imageUrl": "https://…",
      "applyUrl": "https://…",
      "categoryMatched": "Dining",
      "rewardRateApplied": 0.04,
      "monthlyReward": 800,
      "annualReward": 9600,
      "netBenefit": 9101,
      "capApplied": false,
      "approvalSignal": "high"
    }
  ]
}
```

`netBenefit` is the sorted key (highest first; ties break by lower fee, then
name). `approvalSignal` is `"high"` when income ≥ 1.2× the card's `minIncome`,
else `"eligible"`.

#### Examples

Valid request:

```bash
curl -s http://localhost:4000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{ "monthlySpend": 20000, "topCategory": "Dining", "annualIncome": 800000 }'
```

Rejected (PII key present) → `400`:

```bash
curl -s http://localhost:4000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{ "monthlySpend": 20000, "topCategory": "Dining", "annualIncome": 800000, "email": "a@b.com" }'
# { "error": "This is a zero-PII service. …", "offendingKey": "email" }
```

Rejected (bad input) → `400`:

```bash
curl -s http://localhost:4000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{ "monthlySpend": -5, "topCategory": "", "annualIncome": "lots" }'
# { "error": "Invalid request.", "details": [ … ] }
```

---

## Architecture notes

- **Scoring is pure.** All recommendation math lives in
  [`src/scoring.ts`](src/scoring.ts) with no Express/Prisma imports, so it stays
  unit-testable (`npm test`). Prisma returns `Decimal` for `reward_rate`; the
  route layer converts it to `number` before calling `recommend()`.
- **Zero-PII by construction.** The schema has no PII columns, and the route
  refuses PII-like request keys. See [`CLAUDE.md`](../CLAUDE.md) for the full
  mandate and conventions.
- **Hardened HTTP layer.** `helmet` sets security headers, `express-rate-limit`
  caps the endpoint at 60 req/min/IP (`429` past that), the JSON body is capped
  at 16 kb, and the card catalogue is cached in-process (5-min TTL, see
  [`src/catalogue.ts`](src/catalogue.ts)) so bursts don't re-query Neon.
- **Legal:** independent recommendation engine — not a bank, not endorsed by any
  bank. Don't host bank logos directly; use affiliate-supplied assets.
