export interface CardMultiplier {
  category: string;
  rewardRate: number;
  maxCap: number | null;
}

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
