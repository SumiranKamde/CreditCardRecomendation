// Net Annual Benefit scoring engine.
// ---------------------------------------------------------------------------
// Pure, dependency-free functions (no Express, no Prisma, no DB). This is the
// single source of truth for the recommendation math and is exercised directly
// by tests/scoring.test.ts. Keep it that way.
//
// Algorithm (from the project blueprint):
//   1. HARD FILTER   — drop any card whose min_income > the user's annual_income.
//   2. SCORE         — for the user's chosen category/categories:
//                        monthlyReward = sum(monthlySpend_per_cat * rewardRate_cat)
//                        if maxCap != null: monthlyReward = min(monthlyReward, maxCap)
//                        netBenefit    = monthlyReward * 12 - annualFee
//   3. SORT          — highest netBenefit first.
// ---------------------------------------------------------------------------

import {
  BASE_CATEGORY,
  type Card,
  type CardMultiplier,
  type RecommendationInput,
  type ScoredCard,
  type ApprovalSignal,
} from "./types.ts";

/** Income headroom (over the card minimum) at/above which we flag "high". */
const HIGH_APPROVAL_MULTIPLIER = 1.2;

/** Round to 2 decimal places, avoiding binary-float noise like 6000.0000001. */
function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

/** Extract normalized list of chosen categories from input. */
export function getSelectedCategories(input: RecommendationInput): string[] {
  if (Array.isArray(input.selectedCategories) && input.selectedCategories.length > 0) {
    const valid = input.selectedCategories.map((c) => c.trim()).filter((c) => c.length > 0);
    if (valid.length > 0) return valid;
  }
  if (typeof input.topCategory === "string" && input.topCategory.trim().length > 0) {
    const parts = input.topCategory.split(",").map((c) => c.trim()).filter((c) => c.length > 0);
    if (parts.length > 0) return parts;
  }
  return [BASE_CATEGORY];
}

/**
 * Pick the reward rule to apply for a given category:
 *   1. exact (case-insensitive) category match, else
 *   2. the card's "Other" base rule, else
 *   3. a synthetic zero-reward rule.
 */
export function pickRule(card: Card, category: string): CardMultiplier {
  const target = normalize(category);
  const exact = card.multipliers.find((m) => normalize(m.category) === target);
  if (exact) return exact;

  const base = card.multipliers.find(
    (m) => normalize(m.category) === normalize(BASE_CATEGORY),
  );
  if (base) return base;

  return { category: "None", rewardRate: 0, maxCap: null };
}

/** True when the user's income clears the card's minimum. */
export function isEligible(card: Card, annualIncome: number): boolean {
  return card.minIncome <= annualIncome;
}

function approvalSignalFor(card: Card, annualIncome: number): ApprovalSignal {
  return annualIncome >= card.minIncome * HIGH_APPROVAL_MULTIPLIER
    ? "high"
    : "eligible";
}

/** Score a single (already-eligible) card for the given request. */
export function scoreCard(card: Card, input: RecommendationInput): ScoredCard {
  const categories = getSelectedCategories(input);
  const spend = Math.max(0, input.monthlySpend);
  const spendPerCategory = categories.length > 0 ? spend / categories.length : spend;

  let totalMonthlyReward = 0;
  let anyCapApplied = false;
  const matchedCategories: string[] = [];
  const appliedRates: number[] = [];

  for (const cat of categories) {
    const rule = pickRule(card, cat);
    matchedCategories.push(rule.category);
    appliedRates.push(rule.rewardRate);

    const uncappedMonthly = spendPerCategory * rule.rewardRate;
    const isCapped = rule.maxCap !== null && uncappedMonthly > rule.maxCap;
    if (isCapped) anyCapApplied = true;
    const monthlyCatReward = isCapped ? (rule.maxCap as number) : uncappedMonthly;
    totalMonthlyReward += monthlyCatReward;
  }

  const annualReward = totalMonthlyReward * 12;
  const netBenefit = annualReward - card.annualFee;
  const avgRate = appliedRates.length > 0 ? appliedRates.reduce((a, b) => a + b, 0) / appliedRates.length : 0;

  // Single category compatibility vs multi-category display
  const categoryMatched = categories.length === 1
    ? (matchedCategories[0] || BASE_CATEGORY)
    : Array.from(new Set(matchedCategories)).join(", ");

  return {
    id: card.id,
    bankName: card.bankName,
    cardName: card.cardName,
    annualFee: card.annualFee,
    minIncome: card.minIncome,
    imageUrl: card.imageUrl,
    applyUrl: card.applyUrl,
    categoryMatched,
    rewardRateApplied: round2(avgRate * 10000) / 10000,
    monthlyReward: round2(totalMonthlyReward),
    annualReward: round2(annualReward),
    netBenefit: round2(netBenefit),
    capApplied: anyCapApplied,
    approvalSignal: approvalSignalFor(card, input.annualIncome),
  };
}

/**
 * The full pipeline: hard-filter by income, score the survivors, and return
 * them sorted by Net Annual Benefit (highest first). Ties break by lower
 * annual fee, then card name, for stable, sensible ordering.
 */
export function recommend(
  cards: Card[],
  input: RecommendationInput,
): ScoredCard[] {
  return cards
    .filter((card) => isEligible(card, input.annualIncome))
    .map((card) => scoreCard(card, input))
    .sort((a, b) => {
      if (b.netBenefit !== a.netBenefit) return b.netBenefit - a.netBenefit;
      if (a.annualFee !== b.annualFee) return a.annualFee - b.annualFee;
      return a.cardName.localeCompare(b.cardName);
    });
}
