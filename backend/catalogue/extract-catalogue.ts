import { readFile, writeFile } from "node:fs/promises";

interface SourceCard {
  cardName: string;
  bankName: string;
  sourceUrl: string | null;
}

interface ExtractedCard {
  cardName: string;
  bankName: string;
  sourceUrl: string;
  lastVerifiedAt: string;
  annualFee: number | null;
  minIncome: number | null;
  applyUrl: string | null;
  imageUrl: string | null;
  multipliers: Array<{
    category: "Travel" | "Fuel" | "Dining" | "Shopping" | "Online" | "Other";
    rewardRate: number;
    maxCap: number | null;
  }>;
}

const apiUrl = process.env.LLM_API_URL ?? "https://api.openai.com/v1/chat/completions";
const apiKey = process.env.LLM_API_KEY;
const model = process.env.LLM_MODEL ?? "gpt-4o-mini";

if (!apiKey) {
  console.error("Missing LLM_API_KEY. Set it before running catalogue:extract.");
  process.exit(1);
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractJson(content: string): unknown {
  const fenced = content.match(/```json\s*([\s\S]*?)\s*```/i);
  return JSON.parse(fenced?.[1] ?? content);
}

async function extractCard(card: SourceCard): Promise<ExtractedCard> {
  if (!card.sourceUrl) throw new Error(`${card.cardName}: missing sourceUrl`);
  const sourceResponse = await fetch(card.sourceUrl, {
    headers: { "User-Agent": "CCR-CatalogueBot/0.1 (maintenance audit)" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!sourceResponse.ok) throw new Error(`${card.cardName}: source returned HTTP ${sourceResponse.status}`);

  const sourceText = stripHtml(await sourceResponse.text()).slice(0, 50_000);
  const prompt = `You extract credit-card facts from one official issuer page. Return ONLY valid JSON matching this shape. Never guess: use null or [] when a fact is absent. rewardRate must be a fraction (0.05 means 5%). maxCap is a monthly INR reward-value cap. Map every reward rule to exactly one category: Travel, Fuel, Dining, Shopping, Online, or Other. Include exactly one Other fallback rule when the source provides a general rate; otherwise use an empty multipliers array. Do not create affiliate URLs or image URLs.

{
  "cardName": "${card.cardName}",
  "bankName": "${card.bankName}",
  "sourceUrl": "${card.sourceUrl}",
  "lastVerifiedAt": "${new Date().toISOString().slice(0, 10)}",
  "annualFee": 0,
  "minIncome": 0,
  "applyUrl": null,
  "imageUrl": null,
  "multipliers": [{ "category": "Other", "rewardRate": 0.01, "maxCap": null }]
}

Official page text:
${sourceText}`;

  const llmResponse = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a precise financial data extraction service. Output JSON only." },
        { role: "user", content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!llmResponse.ok) throw new Error(`${card.cardName}: LLM returned HTTP ${llmResponse.status}`);

  const payload = await llmResponse.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error(`${card.cardName}: LLM returned no content`);
  return extractJson(content) as ExtractedCard;
}

const worksheetUrl = new URL("../prisma/verified-catalogue.template.json", import.meta.url);
const outputUrl = new URL("./llm-draft.json", import.meta.url);
const worksheet = JSON.parse(await readFile(worksheetUrl, "utf8")) as { cards?: SourceCard[] };
const cards: ExtractedCard[] = [];
const failures: Array<{ cardName: string; error: string }> = [];

for (const card of worksheet.cards ?? []) {
  try {
    cards.push(await extractCard(card));
    console.log(`Extracted ${card.cardName}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push({ cardName: card.cardName, error: message });
    console.error(message);
  }
}

await writeFile(outputUrl, `${JSON.stringify({ generatedAt: new Date().toISOString(), cards, failures }, null, 2)}\n`);
console.log(`Draft written to ${outputUrl.pathname}; ${cards.length} extracted, ${failures.length} failed.`);
if (failures.length > 0) process.exitCode = 1;
