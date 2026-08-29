import { NextResponse } from "next/server";
import { VERIFIED_CARDS } from "@/app/lib/catalogueData";
import type { ScoredCard, RecommendationInput } from "@/app/lib/types";

const HIGH_APPROVAL_MULTIPLIER = 1.2;
const BASE_CATEGORY = "Other";

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function getSelectedCategories(input: RecommendationInput): string[] {
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

function scoreCard(card: typeof VERIFIED_CARDS[0], input: RecommendationInput): ScoredCard {
  const categories = getSelectedCategories(input);
  const spend = Math.max(0, input.monthlySpend || 0);
  const spendPerCategory = categories.length > 0 ? spend / categories.length : spend;

  let totalMonthlyReward = 0;
  let anyCapApplied = false;
  const matchedCategories: string[] = [];
  const appliedRates: number[] = [];

  for (const cat of categories) {
    const target = normalize(cat);
    const exact = card.multipliers.find((m) => normalize(m.category) === target);
    const base = card.multipliers.find((m) => normalize(m.category) === normalize(BASE_CATEGORY));
    const rule = exact || base || { category: "None", rewardRate: 0, maxCap: null };

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

  const categoryMatched = categories.length === 1
    ? (matchedCategories[0] || BASE_CATEGORY)
    : Array.from(new Set(matchedCategories)).join(", ");

  const approvalSignal = (input.annualIncome || 0) >= card.minIncome * HIGH_APPROVAL_MULTIPLIER
    ? ("high" as const)
    : ("eligible" as const);

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
    approvalSignal,
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RecommendationInput;
    const annualIncome = Number(body.annualIncome) || 0;

    const scored = VERIFIED_CARDS
      .filter((card) => card.minIncome <= annualIncome)
      .map((card) => scoreCard(card, body))
      .sort((a, b) => {
        if (b.netBenefit !== a.netBenefit) return b.netBenefit - a.netBenefit;
        if (a.annualFee !== b.annualFee) return a.annualFee - b.annualFee;
        return a.cardName.localeCompare(b.cardName);
      });

    return NextResponse.json({
      count: scored.length,
      recommendations: scored,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request payload", details: err instanceof Error ? err.message : String(err) },
      { status: 400 }
    );
  }
}
