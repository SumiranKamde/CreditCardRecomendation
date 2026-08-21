// Mirrors the Phase 1 API contract (backend/src/types.ts). Kept as a small hand
// written copy rather than a shared package: the surface is three fields in and
// one array out, and the frontend must never import Prisma types.

/** One scored card as returned by POST /api/recommendations. */
export interface ScoredCard {
  id: string;
  bankName: string;
  cardName: string;
  annualFee: number;
  minIncome: number;
  imageUrl: string;
  applyUrl: string;
  /** The category rule that was applied — falls back to "Other". */
  categoryMatched: string;
  /** A FRACTION: 0.05 means 5% back. */
  rewardRateApplied: number;
  monthlyReward: number;
  annualReward: number;
  /** annualReward − annualFee. The sorted key; may be negative. */
  netBenefit: number;
  /** True when a monthly cap reduced the reward before annualising. */
  capApplied: boolean;
  approvalSignal: "high" | "eligible";
}

export interface RecommendationsResponse {
  count: number;
  recommendations: ScoredCard[];
}

/** The only three fields the API accepts — it rejects every other key. */
export interface RecommendationInput {
  monthlySpend: number;
  topCategory: string;
  annualIncome: number;
}
