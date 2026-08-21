import { readFile } from "node:fs/promises";

interface Multiplier {
  category: string;
  rewardRate: number;
  maxCap: number | null;
}

interface CatalogueCard {
  cardName: string;
  bankName: string;
  sourceUrl: string | null;
  lastVerifiedAt: string | null;
  annualFee: number | null;
  minIncome: number | null;
  applyUrl: string | null;
  imageUrl: string | null;
  multipliers: Multiplier[];
}

const filePath = new URL("./verified-catalogue.template.json", import.meta.url);
const document = JSON.parse(await readFile(filePath, "utf8")) as {
  cards?: CatalogueCard[];
};
const errors: string[] = [];
const warnings: string[] = [];
const seenNames = new Set<string>();

function isPlaceholderUrl(value: string): boolean {
  return /example\.com|placehold\.co|placeholder|cloudinary\.com\/demo\//i.test(value);
}

const supportedCategories = new Set([
  "travel",
  "fuel",
  "dining",
  "shopping",
  "online",
  "other",
]);

for (const [index, card] of (document.cards ?? []).entries()) {
  const label = `cards[${index}] ${card.bankName} ${card.cardName}`;
  const normalizedName = card.cardName.trim().toLowerCase();
  if (seenNames.has(normalizedName)) errors.push(`${label}: duplicate card name.`);
  seenNames.add(normalizedName);

  if (!card.sourceUrl) errors.push(`${label}: sourceUrl is required.`);
  if (!card.lastVerifiedAt || Number.isNaN(Date.parse(card.lastVerifiedAt))) {
    errors.push(`${label}: lastVerifiedAt must be a valid date.`);
  }
  if (typeof card.annualFee !== "number" || card.annualFee < 0) {
    errors.push(`${label}: annualFee must be a non-negative number.`);
  }
  if (typeof card.minIncome !== "number" || card.minIncome < 0) {
    errors.push(`${label}: minIncome must be a non-negative annual amount.`);
  }

  for (const field of ["sourceUrl", "applyUrl"] as const) {
    const value = card[field];
    if (!value) errors.push(`${label}: ${field} is required.`);
    if (value && isPlaceholderUrl(value)) errors.push(`${label}: ${field} uses a placeholder URL.`);
  }
  if (!card.imageUrl) warnings.push(`${label}: imageUrl is pending.`);
  else if (isPlaceholderUrl(card.imageUrl)) warnings.push(`${label}: imageUrl is a placeholder and remains pending.`);
  if (card.applyUrl && !/^https:\/\//i.test(card.applyUrl)) errors.push(`${label}: applyUrl must use HTTPS.`);
  if (card.sourceUrl && !/^https:\/\//i.test(card.sourceUrl)) errors.push(`${label}: sourceUrl must use HTTPS.`);

  const hasOtherRule = card.multipliers.some((rule) => rule.category.trim().toLowerCase() === "other");
  if (!hasOtherRule) errors.push(`${label}: an Other fallback rule is required.`);
  const categories = new Set<string>();
  for (const rule of card.multipliers) {
    const category = rule.category.trim().toLowerCase();
    if (!supportedCategories.has(category)) {
      errors.push(`${label}: ${rule.category} must be mapped to Travel, Fuel, Dining, Shopping, Online, or Other.`);
    }
    if (categories.has(category)) errors.push(`${label}: duplicate ${rule.category} multiplier.`);
    categories.add(category);
    if (typeof rule.rewardRate !== "number" || rule.rewardRate < 0 || rule.rewardRate >= 1) {
      errors.push(`${label}: ${rule.category} rewardRate must be a fraction from 0 to less than 1.`);
    }
    if (rule.maxCap !== null && (typeof rule.maxCap !== "number" || rule.maxCap < 0)) {
      errors.push(`${label}: ${rule.category} maxCap must be null or non-negative.`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Catalogue validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Catalogue validation passed for ${document.cards?.length ?? 0} card(s).`);
}

if (warnings.length > 0) {
  console.warn(`Catalogue warnings (${warnings.length}):`);
  for (const warning of warnings) console.warn(`- ${warning}`);
}
