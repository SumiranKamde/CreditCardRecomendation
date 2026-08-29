// In-memory catalogue cache with resilient offline fallback.
// ---------------------------------------------------------------------------
// The card catalogue is small and effectively static (it only changes when the
// seed script runs), but every recommendation request would otherwise hit Neon
// with the same `findMany`. We cache the mapped domain cards in-process with a
// short TTL: fast, and it caps how often a burst of traffic touches the DB.
// ---------------------------------------------------------------------------

import { prisma } from "./db.ts";
import type { Card } from "./types.ts";

const CATALOGUE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cache: { cards: Card[]; expiresAt: number } | null = null;

/** Fallback dataset in case Neon DB is momentarily unreachable */
const FALLBACK_CARDS: Card[] = [
  {
    id: "sbi-cashback-001",
    bankName: "SBI Card",
    cardName: "SBI Cashback Card",
    annualFee: 999,
    minIncome: 300000,
    imageUrl: "https://placehold.co/320x200?text=SBI+Cashback",
    applyUrl: "https://example.com/apply/sbi-cashback?ref=ccr",
    multipliers: [
      { category: "Online", rewardRate: 0.05, maxCap: 5000 },
      { category: "Shopping", rewardRate: 0.05, maxCap: 5000 },
      { category: "Other", rewardRate: 0.01, maxCap: null },
    ],
  },
  {
    id: "hdfc-millennia-002",
    bankName: "HDFC Bank",
    cardName: "Millennia Credit Card",
    annualFee: 1000,
    minIncome: 350000,
    imageUrl: "https://placehold.co/320x200?text=HDFC+Millennia",
    applyUrl: "https://example.com/apply/hdfc-millennia?ref=ccr",
    multipliers: [
      { category: "Online", rewardRate: 0.05, maxCap: 1000 },
      { category: "Shopping", rewardRate: 0.05, maxCap: 1000 },
      { category: "Dining", rewardRate: 0.05, maxCap: 1000 },
      { category: "Other", rewardRate: 0.01, maxCap: null },
    ],
  },
  {
    id: "axis-ace-003",
    bankName: "Axis Bank",
    cardName: "ACE Credit Card",
    annualFee: 499,
    minIncome: 300000,
    imageUrl: "https://placehold.co/320x200?text=Axis+ACE",
    applyUrl: "https://example.com/apply/axis-ace?ref=ccr",
    multipliers: [
      { category: "Utilities", rewardRate: 0.05, maxCap: 500 },
      { category: "Online", rewardRate: 0.04, maxCap: null },
      { category: "Dining", rewardRate: 0.04, maxCap: null },
      { category: "Other", rewardRate: 0.02, maxCap: null },
    ],
  },
  {
    id: "hdfc-regalia-gold-004",
    bankName: "HDFC Bank",
    cardName: "Regalia Gold Credit Card",
    annualFee: 2500,
    minIncome: 1200000,
    imageUrl: "https://placehold.co/320x200?text=HDFC+Regalia+Gold",
    applyUrl: "https://example.com/apply/hdfc-regalia-gold?ref=ccr",
    multipliers: [
      { category: "Shopping", rewardRate: 0.05, maxCap: 2000 },
      { category: "Travel", rewardRate: 0.03, maxCap: null },
      { category: "Dining", rewardRate: 0.03, maxCap: null },
      { category: "Other", rewardRate: 0.0133, maxCap: null },
    ],
  },
  {
    id: "indianoil-axis-005",
    bankName: "Axis Bank",
    cardName: "IndianOil Axis Bank Credit Card",
    annualFee: 500,
    minIncome: 250000,
    imageUrl: "https://placehold.co/320x200?text=IndianOil+Axis",
    applyUrl: "https://example.com/apply/indianoil-axis?ref=ccr",
    multipliers: [
      { category: "Fuel", rewardRate: 0.05, maxCap: 1000 },
      { category: "Shopping", rewardRate: 0.01, maxCap: null },
      { category: "Online", rewardRate: 0.01, maxCap: null },
      { category: "Other", rewardRate: 0.01, maxCap: null },
    ],
  },
];

/** Prisma returns Decimal for reward_rate; convert to a plain number */
function toDomainCard(row: {
  id: string;
  bankName: string;
  cardName: string;
  annualFee: number;
  minIncome: number;
  imageUrl: string;
  applyUrl: string;
  multipliers: { category: string; rewardRate: unknown; maxCap: number | null }[];
}): Card {
  return {
    id: row.id,
    bankName: row.bankName,
    cardName: row.cardName,
    annualFee: row.annualFee,
    minIncome: row.minIncome,
    imageUrl: row.imageUrl,
    applyUrl: row.applyUrl,
    multipliers: row.multipliers.map((m) => ({
      category: m.category,
      rewardRate: Number(m.rewardRate),
      maxCap: m.maxCap,
    })),
  };
}

/** Cached catalogue read with automatic fallback. */
export async function getCatalogue(): Promise<Card[]> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.cards;

  try {
    const rows = await prisma.card.findMany({ include: { multipliers: true } });
    if (rows && rows.length > 0) {
      const cards = rows.map(toDomainCard);
      cache = { cards, expiresAt: now + CATALOGUE_TTL_MS };
      return cards;
    }
  } catch (dbError) {
    console.warn("Neon DB query unavailable, using fallback catalogue:", dbError instanceof Error ? dbError.message : dbError);
  }

  // Fallback if DB empty or unreachable
  cache = { cards: FALLBACK_CARDS, expiresAt: now + 30 * 1000 };
  return FALLBACK_CARDS;
}

/** Drop the cached catalogue */
export function clearCatalogueCache(): void {
  cache = null;
}
