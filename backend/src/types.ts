// Shared domain types for the recommendation engine.
// Dependency-free on purpose so the scoring logic can be unit-tested by running
// this file directly with Node's built-in TypeScript support (no build step).

/** The base/everything-else category used as a fallback rate. */
export const BASE_CATEGORY = "Other";

/** A single per-category reward rule on a card. */
export interface CardMultiplier {
  category: string;
  /** Fraction of spend returned as value. 0.05 = 5% back. */
  rewardRate: number;
  /** Optional monthly cap on the reward value in INR. null = uncapped. */
  maxCap: number | null;
}

/** A credit card plus its reward rules. Mirrors the Prisma models, but with
 *  plain `number` reward rates (Prisma returns Decimal objects — the route
 *  layer converts them before calling the scorer). */
export interface Card {
  id: string;
  bankName: string;
  cardName: string;
  annualFee: number;
  minIncome: number;
  imageUrl: string;
  applyUrl: string;
  multipliers: CardMultiplier[];
}

/** The anonymous, zero-PII request payload. */
export interface RecommendationInput {
  /** Monthly spend in the chosen category, in INR. */
  monthlySpend: number;
  /** The category the user spends most on, e.g. "Fuel". */
  topCategory: string;
  /** The user's annual income in INR. Used only for the eligibility filter. */
  annualIncome: number;
}

/** Rough approval signal derived purely from the income headroom over the
 *  card's minimum. Not a guarantee — banks make the final call. */
export type ApprovalSignal = "high" | "eligible";

/** A card scored against a specific request. */
export interface ScoredCard {
  id: string;
  bankName: string;
  cardName: string;
  annualFee: number;
  minIncome: number;
  imageUrl: string;
  applyUrl: string;

  /** Which category rule was actually applied (may be the "Other" fallback). */
  categoryMatched: string;
  /** The reward rate applied, as a fraction (0.05 = 5%). */
  rewardRateApplied: number;
  /** Monthly reward value in INR after applying any cap. */
  monthlyReward: number;
  /** Annual reward value in INR (monthlyReward * 12). */
  annualReward: number;
  /** Net Annual Benefit in INR: annualReward - annualFee. Can be negative. */
  netBenefit: number;
  /** Whether the capped kicked in for this card/category. */
  capApplied: boolean;
  /** Heuristic approval signal from income headroom. */
  approvalSignal: ApprovalSignal;
}
