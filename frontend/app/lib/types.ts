// Mirrors the API contract (backend/src/types.ts).

/** One scored card as returned by POST /api/recommendations. */
export interface ScoredCard {
  id: string;
  bankName: string;
  cardName: string;
  annualFee: number;
  minIncome: number;
  imageUrl: string;
  applyUrl: string;
  /** The category rule(s) that were applied. */
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

/** Anonymous zero-PII recommendation payload. */
export interface RecommendationInput {
  monthlySpend: number;
  topCategory?: string;
  selectedCategories?: string[];
  annualIncome: number;
}
