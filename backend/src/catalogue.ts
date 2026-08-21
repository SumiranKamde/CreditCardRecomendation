// In-memory catalogue cache.
// ---------------------------------------------------------------------------
// The card catalogue is small and effectively static (it only changes when the
// seed script runs), but every recommendation request would otherwise hit Neon
// with the same `findMany`. We cache the mapped domain cards in-process with a
// short TTL: fast, and it caps how often a burst of traffic touches the DB
// (protecting the free-tier connection/compute quota).
//
// Trade-off: after a re-seed, a running server keeps serving the previous
// catalogue until the TTL lapses (≤ CATALOGUE_TTL_MS). That is fine for data
// that changes on the order of days.
// ---------------------------------------------------------------------------

import { prisma } from "./db.ts";
import type { Card } from "./types.ts";

const CATALOGUE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cache: { cards: Card[]; expiresAt: number } | null = null;

/** Prisma returns Decimal for reward_rate; convert to a plain number here so
 *  the pure scorer never sees a Prisma type. */
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

/** Cached catalogue read. Serves the in-memory copy while warm; on a cold or
 *  expired cache it fetches from Neon once and re-warms. */
export async function getCatalogue(): Promise<Card[]> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.cards;

  const rows = await prisma.card.findMany({ include: { multipliers: true } });
  const cards = rows.map(toDomainCard);
  cache = { cards, expiresAt: now + CATALOGUE_TTL_MS };
  return cards;
}

/** Drop the cached catalogue (e.g. after a re-seed within the same process). */
export function clearCatalogueCache(): void {
  cache = null;
}
