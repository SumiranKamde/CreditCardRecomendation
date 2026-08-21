# Master Project Plan — India Credit Card Recommendation Engine

Reference document for the full build. Day-to-day rules and current status live in
`CLAUDE.md`; this file is the complete plan across all phases. Adapted to the chosen
stack: **TypeScript + Express + Prisma + Neon Postgres**, with a `backend/` +
`frontend/` split so the two deploy independently (API on Render/Railway, web on Vercel).

---

## 1. Overview & Core Principles

A web-based financial aggregator for the Indian market that recommends credit cards
based strictly on anonymous behavioral input (spending habits + income). It computes
the **Net Annual Benefit** of each eligible card and links out to an affiliate
"Apply Now" page.

- **Zero-PII mandate.** The app never asks for, processes, or stores names, emails,
  phone numbers, PAN, or bank logins. This is both the primary trust differentiator
  (vs. incumbents that harvest phone numbers → spam calls) and the legal shield
  (it stays outside India's DPDP Act obligations).
- **Affiliate-only monetization.** Revenue comes from affiliate networks (EarnKaro,
  GroMo, Cuelinks, ClariFi) — never by touching user money. This keeps the product
  outside RBI Payment Aggregator regulation, and the affiliate network acts as the
  registered DSA.
- **Curate, don't catalogue.** Maintain the top ~30–40 cards with rigorous accuracy
  rather than 300+ stale entries. Small, fast, and trustworthy beats big and outdated.
- **Interactive utility, not a blog.** The defensible edge is the calculator/UX, not
  written reviews.

---

## 2. Tech Stack & AI Integration

- **Frontend (Phase 2):** Next.js (App Router) + React + Tailwind CSS.
- **Backend:** Node.js (v22+) + Express + TypeScript (run via Node's native type
  stripping; no build step). Prisma ORM.
- **Database:** PostgreSQL on **Neon** (free tier). Add the `pgvector` extension in
  Phase 5 for the RAG feature.
- **Images:** Cloudinary — store URLs only; never host bank logos directly.
- **AI tooling stack:**
  - *Codebase generation:* Claude Code.
  - *Automated bank-data scraping (Phase 5):* Gemini Flash API + Python/Playwright on
    a weekly cron.
  - *Fine-print RAG chatbot (Phase 5):* Gemini Flash + `pgvector`.
  - *Zero-PII local statement parsing (Phase 5):* Transformers.js in the browser
    (WebAssembly) — the statement PDF never leaves the user's device.

---

## 3. Database Schema

Prisma models live in `backend/prisma/schema.prisma`. Equivalent SQL:

```sql
CREATE TABLE cards (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_name   VARCHAR NOT NULL,
    card_name   VARCHAR NOT NULL,
    annual_fee  INTEGER NOT NULL,          -- ₹, whole rupees (0 = lifetime free)
    min_income  INTEGER NOT NULL,          -- ₹ ANNUAL minimum income
    image_url   VARCHAR NOT NULL,          -- Cloudinary / affiliate asset URL
    apply_url   VARCHAR NOT NULL           -- affiliate tracking link
);

CREATE TABLE card_multipliers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id     UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    category    VARCHAR NOT NULL,          -- 'Travel','Fuel','Dining','Shopping','Online','Other'
    reward_rate DECIMAL(6,4) NOT NULL,     -- FRACTION: 0.05 = 5% back
    max_cap     INTEGER                    -- MONTHLY ₹ cap on reward value; NULL = uncapped
);
```

**Modeling conventions (must stay consistent with `src/scoring.ts`):**

- `reward_rate` is a **fraction** (0.05 = 5%), not a percentage number.
- `min_income` is **annual**.
- `max_cap` is a **monthly** rupee cap, applied to the monthly reward before ×12.
- Category `"Other"` is the base/everything-else rate and the fallback when the
  chosen category has no specific rule on a card. Seed every card with an `"Other"` rule.

---

## 4. The Recommendation Algorithm

`POST /api/recommendations` with body `{ monthlySpend, topCategory, annualIncome }`
(ranges: monthly spend ~₹10k–₹1L, annual income ~₹2L–₹20L; `monthlySpend = 0` is a
valid edge case and must be handled gracefully).

1. **Hard filter:** drop any card where `min_income > annualIncome`.
2. **Score** each surviving card for the chosen category (fallback to `"Other"`):
   - `monthlyReward = monthlySpend * reward_rate`
   - if `max_cap != null`: `monthlyReward = min(monthlyReward, max_cap)`
   - `annualReward = monthlyReward * 12`
   - `netBenefit = annualReward - annual_fee`
3. **Sort** by `netBenefit` descending (tie-break: lower `annual_fee`, then card name).
4. Return `{ count, recommendations: [...] }`. Each item also carries a derived
   `approvalSignal` ("high" when income ≥ 1.2× `min_income`, else "eligible").

This is implemented and unit-tested in `backend/src/scoring.ts` /
`backend/tests/scoring.test.ts` (12 passing tests).

---

## 5. Development Phases

### Phase 1 — Backend & API  *(complete)*

Done: scaffold (package.json, tsconfig, .gitignore, .env.example), Prisma schema,
shared types, the pure scoring engine, and its tests (all passing).

Implemented and verified against Neon:

- `src/db.ts` — Prisma client singleton.
- `src/routes/recommendations.ts` — input validation (numbers; allow 0 spend; reject
  PII keys), Prisma fetch, `Decimal`→`number` conversion, call `recommend()`, respond.
- `src/server.ts` — Express bootstrap: `cors` (from `CORS_ORIGIN`), `express.json()`,
  `GET /health`, mount route, listen on `PORT` (default 4000).
- `prisma/seed.ts` — 5 illustrative Indian cards (each with an `"Other"` rule).
- `README.md` — Neon setup + run commands + API examples.

Verification includes unit tests, type-checking, live database reads, input
validation, zero-PII rejection, rate limiting, caching, and sorted API output.

### Phase 2 — Next.js Frontend & UX  *(complete)*

- Init `frontend/` (Next.js App Router + Tailwind).
- Input components: income slider, monthly-spend slider, category dropdown.
- Results dashboard rendering the API's sorted JSON.
- **The "Net Benefit" hook:** show `Fee | Est. reward = Net ₹X profit`, profit in green.
- **Approval indicator:** show "High Chance of Approval" using `approvalSignal`.
- **Security rule:** every "Apply Now" anchor uses
  `target="_blank" rel="noopener noreferrer"`.
- High-quality Cloudinary image rendering; flawless mobile responsiveness.

Implemented: the calculator UI, API integration through a same-origin Next.js
proxy, loading/error/empty states, responsive recommendation cards, approval
signals, net-benefit presentation, affiliate disclosure, accessibility labels,
and production build verification.

### Phase 3 — Monetization & Data Curation  *(started)*

- Register on EarnKaro / GroMo / Cuelinks / ClariFi; get publisher credentials.
- Generate per-card affiliate tracking links; populate the production DB with
  **verified** annual fees, reward multipliers, min-income, and `apply_url`s.
- Confirm every outbound link tracks clicks correctly.

Started: illustrative seed data is now blocked when `NODE_ENV=production`, and
the curation workflow is documented in `backend/prisma/CATALOGUE_CHECKLIST.md`.
The provenance schema migration remains deferred until explicitly approved.

### Phase 4 — Programmatic SEO

- Dynamic Next.js routes, e.g. `app/best-cards/[category]/[income]/page.tsx`.
- Generate long-tail landing pages ("Best Travel Cards for ₹10 Lakh Income 2026").
- Server-render metadata with the pre-calculated Net Benefit to lift CTR.
- Site-wide YMYL affiliate disclosure + "not affiliated with banks" disclaimer.

### Phase 5 — Advanced AI Features

- **Automated maintenance scraper:** weekly Python/Playwright + Gemini Flash reads
  official bank MITC docs and flags/updates fee or reward changes.
- **RAG fine-print chatbot:** vectorize MITC terms into `pgvector`; Gemini-powered
  chat answers hyper-specific questions ("does this card reward rent payments?").
- **Local PDF statement parser:** Transformers.js in the frontend auto-fills the
  spend sliders from a user's statement — entirely client-side (Zero-PII preserved).

---

## 6. Monetization & Affiliate Engine

Bypass direct bank DSA contracts initially; use specialist distribution platforms
(EarnKaro, GroMo, Cuelinks, ClariFi). Generate a unique tracking URL per card so each
click and approval maps back to the platform. These networks also supply approved,
high-resolution card images — use those rather than scraping bank logos.

---

## 7. Legal & Compliance Checklist

- **Trademark (nominative fair use):** using bank/card *names* to identify products is
  fine; do not present official *logos* in a way implying partnership/endorsement.
- **Copyright:** facts (fees, income requirements, reward rates) aren't copyrightable —
  free to store/display. Risk is in *how* data is gathered (see maintenance strategy).
- **RBI:** not a Payment Aggregator (never touches user money); affiliate network is
  the registered DSA.
- **DPDP Act:** Zero-PII architecture largely insulates the product.
- Ship three things site-wide: clear disclaimer ("independent recommendation engine,
  not a bank, not endorsed by any bank"), affiliate disclosure, and affiliate-sourced
  images.

---

## 8. SEO & Acquisition

- **YMYL E-E-A-T:** professional About/authorship page stating recommendations are
  purely mathematical from public fee/reward structures; disclaimers top and bottom;
  outbound citations to official bank pages / rbi.org.in.
- **Programmatic SEO:** generate hundreds of targeted pages of the form
  `[Category] Credit Cards for [Income] in [Year]` to win low-competition, high-intent
  long-tail queries instead of fighting incumbents on broad terms.
- **Conversion:** lead with the green "Net ₹X profit" number; show "High Chance of
  Approval"; surface current welcome offers for urgency.
- **Retention:** a "Card Optimizer" (recommend which owned card to use per category),
  devaluation alerts, and social-proof stats turn a one-shot tool into a repeat visit.

---

## 9. Data Sources & Maintenance Strategy

**Sources:** affiliate network "publisher toolkits" (images + baseline data); financial
data APIs (Paisabazaar via marketplaces, Credilio, Datarade) if automating; official
bank **MITC** documents for legally accurate fees/caps; forums (TechnoFino, CardExpert,
r/CreditCardsIndia) for live devaluation news.

**Hybrid update system** (you cannot manually check 40 banks daily):

1. **Early warning:** Google Alerts / RSS on keywords like "HDFC devaluation",
   "SBI cashback terms revised".
2. **Automated diff scraper:** weekly cron hashes each card's official page text and
   pings Discord/Slack when it changes (Phase 5 upgrades this to an LLM extractor).
3. **Crowdsourcing:** a "Spotted outdated info?" button on every card result.
4. **Monthly 2-hour audit:** because the catalogue is only 30–40 cards, a recurring
   manual verification pass is manageable and is the failsafe.

---

## 10. Market Position

Strong technical project with a proven monetization model entering a saturated space
(Paisabazaar, BankBazaar, CardExpert). Edge = Zero-PII trust + hyper-personalized Net
Benefit calculator + programmatic SEO on long-tail intent. Win by staying small, fast,
and rigorously accurate — not by out-reviewing the aggregators.

> Note on dates/versions: specific model names and "2026 best-practice" claims came
> from the original planning chat — treat architecture as sound but verify third-party
> specifics (affiliate payout rates, API limits, model availability) when you reach them.
