// Unit tests for the Net Benefit scoring engine.
// Runs WITHOUT any npm install — Node 22 executes TypeScript directly:
//     node tests/scoring.test.ts
// (or: npm test)
//
// Every expected value below is hand-computed in the comments so the math is
// auditable.

import assert from "node:assert/strict";
import { recommend, scoreCard, pickRule, isEligible } from "../src/scoring.ts";
import type { Card, RecommendationInput } from "../src/types.ts";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${name}`);
    console.error(String(err instanceof Error ? err.message : err));
  }
}

/** Build a Card with sensible defaults, overridable per test. */
function makeCard(partial: Partial<Card> & { multipliers: Card["multipliers"] }): Card {
  return {
    id: partial.id ?? "00000000-0000-0000-0000-000000000000",
    bankName: partial.bankName ?? "TestBank",
    cardName: partial.cardName ?? "Test Card",
    annualFee: partial.annualFee ?? 0,
    minIncome: partial.minIncome ?? 0,
    imageUrl: partial.imageUrl ?? "https://example.com/card.png",
    applyUrl: partial.applyUrl ?? "https://example.com/apply",
    multipliers: partial.multipliers,
  };
}

console.log("\nScoring engine tests\n");

// 1. Basic Net Benefit, no cap.
// 10000 * 0.05 = 500/mo; *12 = 6000; - 1000 fee = 5000.
test("computes net benefit with no cap", () => {
  const card = makeCard({
    annualFee: 1000,
    minIncome: 300000,
    multipliers: [
      { category: "Dining", rewardRate: 0.05, maxCap: null },
      { category: "Other", rewardRate: 0.01, maxCap: null },
    ],
  });
  const input: RecommendationInput = { monthlySpend: 10000, topCategory: "Dining", annualIncome: 500000 };
  const r = scoreCard(card, input);
  assert.equal(r.monthlyReward, 500);
  assert.equal(r.annualReward, 6000);
  assert.equal(r.netBenefit, 5000);
  assert.equal(r.categoryMatched, "Dining");
  assert.equal(r.capApplied, false);
});

// 2. Monthly cap applies BEFORE the *12.
// uncapped 10000*0.05 = 500 -> capped to 100; *12 = 1200; - 500 = 700.
test("applies monthly cap before annualizing", () => {
  const card = makeCard({
    annualFee: 500,
    minIncome: 200000,
    multipliers: [
      { category: "Fuel", rewardRate: 0.05, maxCap: 100 },
      { category: "Other", rewardRate: 0.01, maxCap: null },
    ],
  });
  const input: RecommendationInput = { monthlySpend: 10000, topCategory: "Fuel", annualIncome: 300000 };
  const r = scoreCard(card, input);
  assert.equal(r.monthlyReward, 100);
  assert.equal(r.annualReward, 1200);
  assert.equal(r.netBenefit, 700);
  assert.equal(r.capApplied, true);
});

// 3. Cap present but NOT exceeded -> capApplied false.
// 1000 * 0.05 = 50 < cap 100. annual 600, net 600.
test("does not flag cap when under the cap", () => {
  const card = makeCard({
    annualFee: 0,
    minIncome: 0,
    multipliers: [{ category: "Fuel", rewardRate: 0.05, maxCap: 100 }],
  });
  const r = scoreCard(card, { monthlySpend: 1000, topCategory: "Fuel", annualIncome: 100000 });
  assert.equal(r.monthlyReward, 50);
  assert.equal(r.capApplied, false);
  assert.equal(r.netBenefit, 600);
});

// 4. Falls back to "Other" when the chosen category has no specific rule.
// 5000 * 0.02 = 100/mo; *12 = 1200; - 0 fee = 1200.
test("falls back to Other base rate", () => {
  const card = makeCard({
    annualFee: 0,
    minIncome: 100000,
    multipliers: [
      { category: "Travel", rewardRate: 0.05, maxCap: null },
      { category: "Other", rewardRate: 0.02, maxCap: null },
    ],
  });
  const r = scoreCard(card, { monthlySpend: 5000, topCategory: "Groceries", annualIncome: 400000 });
  assert.equal(r.categoryMatched, "Other");
  assert.equal(r.netBenefit, 1200);
});

// 5. No matching rule and no Other -> zero reward, negative net = -fee.
test("scores zero reward when no rule matches and no Other", () => {
  const card = makeCard({ annualFee: 500, minIncome: 100000, multipliers: [] });
  const r = scoreCard(card, { monthlySpend: 10000, topCategory: "Fuel", annualIncome: 400000 });
  assert.equal(r.categoryMatched, "None");
  assert.equal(r.monthlyReward, 0);
  assert.equal(r.netBenefit, -500);
});

// 6. Category match is case-insensitive.
test("matches category case-insensitively", () => {
  const card = makeCard({ multipliers: [{ category: "Fuel", rewardRate: 0.05, maxCap: null }] });
  const rule = pickRule(card, "fuel");
  assert.equal(rule.category, "Fuel");
});

// 7. Hard filter: min_income > annual_income excludes the card entirely.
test("hard-filters cards above the user's income", () => {
  const cheap = makeCard({ cardName: "Cheap", minIncome: 200000, multipliers: [{ category: "Other", rewardRate: 0.01, maxCap: null }] });
  const premium = makeCard({ cardName: "Premium", minIncome: 1000000, multipliers: [{ category: "Other", rewardRate: 0.05, maxCap: null }] });
  const out = recommend([cheap, premium], { monthlySpend: 10000, topCategory: "Other", annualIncome: 500000 });
  assert.equal(out.length, 1);
  assert.equal(out[0]!.cardName, "Cheap");
  assert.equal(isEligible(premium, 500000), false);
  assert.equal(isEligible(premium, 1000000), true); // boundary: equal is eligible
});

// 8. Sorting by net benefit desc, with lower-fee tie-break.
test("sorts by net benefit descending, then lower fee", () => {
  // A: 10000*0.05*12 - 2000 = 6000 - 2000 = 4000
  const a = makeCard({ cardName: "A", annualFee: 2000, minIncome: 0, multipliers: [{ category: "Other", rewardRate: 0.05, maxCap: null }] });
  // B: 10000*0.05*12 - 1000 = 5000  (highest)
  const b = makeCard({ cardName: "B", annualFee: 1000, minIncome: 0, multipliers: [{ category: "Other", rewardRate: 0.05, maxCap: null }] });
  // C: 10000*0.05*12 - 1000 = 5000  (ties B on benefit; same fee -> name order B before C)
  const c = makeCard({ cardName: "C", annualFee: 1000, minIncome: 0, multipliers: [{ category: "Other", rewardRate: 0.05, maxCap: null }] });
  const out = recommend([a, b, c], { monthlySpend: 10000, topCategory: "Other", annualIncome: 100000 });
  assert.deepEqual(out.map((x) => x.cardName), ["B", "C", "A"]);
  assert.equal(out[0]!.netBenefit, 5000);
  assert.equal(out[2]!.netBenefit, 4000);
});

// 9. Edge case from the blueprint: ₹0 monthly spend must not crash.
// reward 0, net = -fee.
test("handles zero monthly spend gracefully", () => {
  const card = makeCard({ annualFee: 999, minIncome: 300000, multipliers: [{ category: "Online", rewardRate: 0.05, maxCap: 5000 }] });
  const r = scoreCard(card, { monthlySpend: 0, topCategory: "Online", annualIncome: 500000 });
  assert.equal(r.monthlyReward, 0);
  assert.equal(r.netBenefit, -999);
});

// 10. Rounding: messy product rounds to 2 dp.
// 1000 * 0.0333 = 33.3/mo; *12 = 399.6; net (fee 0) = 399.6.
test("rounds monetary outputs to 2 decimals", () => {
  const card = makeCard({ annualFee: 0, minIncome: 0, multipliers: [{ category: "Other", rewardRate: 0.0333, maxCap: null }] });
  const r = scoreCard(card, { monthlySpend: 1000, topCategory: "Other", annualIncome: 100000 });
  assert.equal(r.monthlyReward, 33.3);
  assert.equal(r.annualReward, 399.6);
  assert.equal(r.netBenefit, 399.6);
});

// 11. Approval signal: >= 1.2x min income => "high", else "eligible".
test("derives approval signal from income headroom", () => {
  const card = makeCard({ minIncome: 300000, multipliers: [{ category: "Other", rewardRate: 0.01, maxCap: null }] });
  const high = scoreCard(card, { monthlySpend: 1000, topCategory: "Other", annualIncome: 360000 }); // exactly 1.2x
  const ok = scoreCard(card, { monthlySpend: 1000, topCategory: "Other", annualIncome: 350000 });
  assert.equal(high.approvalSignal, "high");
  assert.equal(ok.approvalSignal, "eligible");
});

// 12. Empty catalogue returns empty array.
test("returns empty array for empty catalogue", () => {
  const out = recommend([], { monthlySpend: 10000, topCategory: "Fuel", annualIncome: 500000 });
  assert.deepEqual(out, []);
});

// 13. Multiple categories test: Fuel (5%) + Shopping (2%)
// spend 20000 split: 10000 on Fuel (500) + 10000 on Shopping (200) = 700/mo -> 8400/yr -> - 1000 fee = 7400
test("scores multi-category blended spend accurately", () => {
  const card = makeCard({
    annualFee: 1000,
    minIncome: 300000,
    multipliers: [
      { category: "Fuel", rewardRate: 0.05, maxCap: null },
      { category: "Shopping", rewardRate: 0.02, maxCap: null },
      { category: "Other", rewardRate: 0.01, maxCap: null },
    ],
  });
  const input: RecommendationInput = {
    monthlySpend: 20000,
    selectedCategories: ["Fuel", "Shopping"],
    annualIncome: 500000,
  };
  const r = scoreCard(card, input);
  assert.equal(r.monthlyReward, 700);
  assert.equal(r.annualReward, 8400);
  assert.equal(r.netBenefit, 7400);
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
