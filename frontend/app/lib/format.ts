// Money and rate formatting. Indian grouping throughout (₹8,00,000 not ₹800,000)
// because the audience reads lakhs and crores.

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** ₹9,101 — whole rupees, Indian digit grouping. */
export function formatINR(amount: number): string {
  return inr.format(Math.round(amount));
}

/** Signed for a ledger: −₹499 / ₹9,101. */
export function formatSignedINR(amount: number): string {
  const rounded = Math.round(amount);
  return rounded < 0 ? `−${inr.format(Math.abs(rounded))}` : inr.format(rounded);
}

/** Short Indian scale for slider labels: 8L, 25L, 1.2Cr. */
export function formatShortINR(amount: number): string {
  if (amount >= 10_000_000) {
    return `₹${trimZero(amount / 10_000_000)}Cr`;
  }
  if (amount >= 100_000) {
    return `₹${trimZero(amount / 100_000)}L`;
  }
  if (amount >= 1_000) {
    return `₹${trimZero(amount / 1_000)}K`;
  }
  return `₹${amount}`;
}

function trimZero(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}

/** rewardRateApplied is a fraction: 0.013 → "1.3%", 0.05 → "5%". */
export function formatRate(rate: number): string {
  const pct = rate * 100;
  return `${trimZero(pct).replace(/\.0$/, "")}%`;
}
