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

/** Fallback dataset with verified links and safe bank portal fallback */
const FALLBACK_CARDS: Card[] = [
  {
    id: "sbi-cashback-001",
    bankName: "SBI Card",
    cardName: "SBI Cashback Credit Card",
    annualFee: 999,
    minIncome: 300000,
    imageUrl: "https://placehold.co/320x200?text=SBI+Cashback",
    applyUrl: "https://www.sbicard.com/en/personal/credit-cards/cashback-sbi-card.html",
    multipliers: [
      { category: "Online", rewardRate: 0.05, maxCap: 2000 },
      { category: "Other", rewardRate: 0.01, maxCap: 2000 },
    ],
  },
  {
    id: "hdfc-millennia-002",
    bankName: "HDFC Bank",
    cardName: "HDFC Millennia Credit Card",
    annualFee: 1000,
    minIncome: 420000,
    imageUrl: "https://placehold.co/320x200?text=HDFC+Millennia",
    applyUrl: "https://bitli.in/14ytBA7",
    multipliers: [
      { category: "Online", rewardRate: 0.05, maxCap: 1000 },
      { category: "Shopping", rewardRate: 0.05, maxCap: 1000 },
      { category: "Dining", rewardRate: 0.05, maxCap: 1000 },
      { category: "Other", rewardRate: 0.01, maxCap: 1000 },
    ],
  },
  {
    id: "scapia-federal-003",
    bankName: "Federal Bank",
    cardName: "Scapia Co-Branded Credit Card",
    annualFee: 0,
    minIncome: 300000,
    imageUrl: "https://placehold.co/320x200?text=Scapia+Travel",
    applyUrl: "https://bitli.in/t7CElb2",
    multipliers: [
      { category: "Travel", rewardRate: 0.20, maxCap: null },
      { category: "Other", rewardRate: 0.10, maxCap: null },
    ],
  },
  {
    id: "axis-flipkart-004",
    bankName: "Axis Bank",
    cardName: "Axis Flipkart Credit Card",
    annualFee: 500,
    minIncome: 300000,
    imageUrl: "https://placehold.co/320x200?text=Axis+Flipkart",
    applyUrl: "https://www.axisbank.com/retail/cards/credit-card/flipkart-axis-bank-credit-card",
    multipliers: [
      { category: "Shopping", rewardRate: 0.05, maxCap: null },
      { category: "Travel", rewardRate: 0.04, maxCap: null },
      { category: "Other", rewardRate: 0.01, maxCap: null },
    ],
  },
  {
    id: "hdfc-swiggy-005",
    bankName: "HDFC Bank",
    cardName: "HDFC Swiggy Ornge Credit Card",
    annualFee: 500,
    minIncome: 180000,
    imageUrl: "https://placehold.co/320x200?text=HDFC+Swiggy",
    applyUrl: "https://bitli.in/wUdobzG",
    multipliers: [
      { category: "Dining", rewardRate: 0.10, maxCap: 1500 },
      { category: "Online", rewardRate: 0.05, maxCap: 1500 },
      { category: "Other", rewardRate: 0.01, maxCap: 500 },
    ],
  },
  {
    id: "axis-cashback-006",
    bankName: "Axis Bank",
    cardName: "Axis Cashback Credit Card",
    annualFee: 500,
    minIncome: 300000,
    imageUrl: "https://placehold.co/320x200?text=Axis+Cashback",
    applyUrl: "https://www.axisbank.com/retail/cards/credit-card/axis-bank-cashback-credit-card",
    multipliers: [
      { category: "Online", rewardRate: 0.05, maxCap: 1000 },
      { category: "Shopping", rewardRate: 0.05, maxCap: 1000 },
      { category: "Other", rewardRate: 0.01, maxCap: null },
    ],
  },
  {
    id: "sbi-elite-007",
    bankName: "SBI Card",
    cardName: "SBI Elite Credit Card",
    annualFee: 4999,
    minIncome: 900000,
    imageUrl: "https://placehold.co/320x200?text=SBI+Elite",
    applyUrl: "https://www.sbicard.com/en/personal/credit-cards/lifestyle/sbi-card-elite.page",
    multipliers: [
      { category: "Dining", rewardRate: 0.05, maxCap: 1250 },
      { category: "Travel", rewardRate: 0.05, maxCap: 1250 },
      { category: "Shopping", rewardRate: 0.03, maxCap: 750 },
      { category: "Other", rewardRate: 0.0125, maxCap: null },
    ],
  },
  {
    id: "axis-magnus-008",
    bankName: "Axis Bank",
    cardName: "Axis Magnus Credit Card",
    annualFee: 10000,
    minIncome: 1800000,
    imageUrl: "https://placehold.co/320x200?text=Axis+Magnus",
    applyUrl: "https://www.axisbank.com/retail/cards/credit-card/axis-bank-magnus-credit-card",
    multipliers: [
      { category: "Travel", rewardRate: 0.12, maxCap: null },
      { category: "Dining", rewardRate: 0.06, maxCap: null },
      { category: "Online", rewardRate: 0.04, maxCap: null },
      { category: "Other", rewardRate: 0.03, maxCap: null },
    ],
  },
  {
    id: "idfc-wow-009",
    bankName: "IDFC FIRST Bank",
    cardName: "IDFC FIRST WOW Credit Card",
    annualFee: 0,
    minIncome: 0,
    imageUrl: "https://placehold.co/320x200?text=IDFC+WOW",
    applyUrl: "https://bitli.in/Ftsw1jM",
    multipliers: [
      { category: "Shopping", rewardRate: 0.01, maxCap: null },
      { category: "Other", rewardRate: 0.005, maxCap: null },
    ],
  },
  {
    id: "bobcard-eterna-010",
    bankName: "BOBCARD",
    cardName: "BOBCARD Eterna Credit Card",
    annualFee: 2499,
    minIncome: 1200000,
    imageUrl: "https://placehold.co/320x200?text=BOBCARD+Eterna",
    applyUrl: "https://bitli.in/zfq2tcW",
    multipliers: [
      { category: "Travel", rewardRate: 0.0375, maxCap: null },
      { category: "Dining", rewardRate: 0.0375, maxCap: null },
      { category: "Other", rewardRate: 0.0075, maxCap: null },
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
