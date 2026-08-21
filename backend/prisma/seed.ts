// Database seed — 5 illustrative Indian credit cards.
// ---------------------------------------------------------------------------
// ⚠️  ILLUSTRATIVE TEST DATA ONLY. The fees, min-income, reward rates and caps
//     below are approximate and are NOT verified against official MITC docs.
//     They exist so the API returns a realistic-looking sorted list during
//     Phase 1/2 development. They MUST be replaced with verified figures and
//     real affiliate `apply_url`s in Phase 3 before any production use.
//
// Modeling reminders (must match src/scoring.ts):
//   • rewardRate is a FRACTION: 0.05 = 5% back.
//   • minIncome is ANNUAL ₹.
//   • maxCap is a MONTHLY ₹ cap on reward value (applied before ×12); null = uncapped.
//   • Every card has an "Other" rule — the base/fallback rate.
//
// Run: npm run seed   (requires DATABASE_URL and `npm run db:push` first)
// ---------------------------------------------------------------------------

// Load .env FIRST: this is a standalone entry point (not booted via server.ts),
// so it must populate DATABASE_URL before ../src/db.ts constructs PrismaClient.
import "dotenv/config";
import { prisma } from "../src/db.ts";

/** Placeholder image + affiliate links. Do NOT ship these — Phase 3 swaps in
 *  affiliate-network-supplied images and real tracking URLs. We never host
 *  bank logos directly. */
function placeholderImage(label: string): string {
  return `https://placehold.co/320x200?text=${encodeURIComponent(label)}`;
}
function placeholderApplyUrl(slug: string): string {
  return `https://example.com/apply/${slug}?ref=ccr-test`;
}

interface SeedCard {
  bankName: string;
  cardName: string;
  slug: string;
  annualFee: number;
  minIncome: number;
  multipliers: { category: string; rewardRate: number; maxCap: number | null }[];
}

const CARDS: SeedCard[] = [
  {
    bankName: "SBI Card",
    cardName: "SBI Cashback Card",
    slug: "sbi-cashback",
    annualFee: 999,
    minIncome: 300000,
    multipliers: [
      { category: "Online", rewardRate: 0.05, maxCap: 5000 }, // 5% online, capped
      { category: "Other", rewardRate: 0.01, maxCap: null }, // 1% offline base
    ],
  },
  {
    bankName: "HDFC Bank",
    cardName: "Millennia Credit Card",
    slug: "hdfc-millennia",
    annualFee: 1000,
    minIncome: 350000,
    multipliers: [
      { category: "Online", rewardRate: 0.05, maxCap: 1000 }, // 5% on select online partners
      { category: "Shopping", rewardRate: 0.05, maxCap: 1000 },
      { category: "Other", rewardRate: 0.01, maxCap: null },
    ],
  },
  {
    bankName: "Axis Bank",
    cardName: "ACE Credit Card",
    slug: "axis-ace",
    annualFee: 499,
    minIncome: 300000,
    multipliers: [
      { category: "Online", rewardRate: 0.04, maxCap: null }, // 4%–5% on bills/food via partners
      { category: "Dining", rewardRate: 0.04, maxCap: null },
      { category: "Other", rewardRate: 0.02, maxCap: null }, // 2% flat base
    ],
  },
  {
    bankName: "HDFC Bank",
    cardName: "Regalia Gold Credit Card",
    slug: "hdfc-regalia-gold",
    annualFee: 2500,
    minIncome: 1200000, // premium tier
    multipliers: [
      { category: "Shopping", rewardRate: 0.05, maxCap: 2000 }, // 5X on select merchants
      { category: "Travel", rewardRate: 0.02, maxCap: null },
      { category: "Other", rewardRate: 0.013, maxCap: null }, // ~4 RP / ₹150 base
    ],
  },
  {
    bankName: "Axis Bank",
    cardName: "IndianOil Axis Bank Credit Card",
    slug: "indianoil-axis",
    annualFee: 500,
    minIncome: 250000,
    multipliers: [
      { category: "Fuel", rewardRate: 0.05, maxCap: 1000 }, // 5% value at IOCL outlets, capped
      { category: "Online", rewardRate: 0.01, maxCap: null },
      { category: "Other", rewardRate: 0.01, maxCap: null },
    ],
  },
];

async function main(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Refusing to seed illustrative card data in production. Use the verified catalogue workflow instead.",
    );
  }

  console.log("Seeding illustrative card data…");

  // Idempotent: clear existing rows first. Deleting cards cascades to
  // card_multipliers (onDelete: Cascade in the schema).
  const deleted = await prisma.card.deleteMany();
  if (deleted.count > 0) console.log(`  cleared ${deleted.count} existing card(s)`);

  for (const c of CARDS) {
    await prisma.card.create({
      data: {
        bankName: c.bankName,
        cardName: c.cardName,
        annualFee: c.annualFee,
        minIncome: c.minIncome,
        imageUrl: placeholderImage(c.cardName),
        applyUrl: placeholderApplyUrl(c.slug),
        multipliers: { create: c.multipliers },
      },
    });
    console.log(`  + ${c.bankName} — ${c.cardName}`);
  }

  const total = await prisma.card.count();
  console.log(`Done. ${total} cards in the catalogue.`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
