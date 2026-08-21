import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

interface CatalogueCard {
  cardName: string;
  bankName: string;
  sourceUrl: string | null;
}

interface SourceSnapshot {
  cardName: string;
  bankName: string;
  sourceUrl: string;
  fetchedAt: string;
  status: number | "error";
  contentHash: string | null;
  contentLength: number;
  error: string | null;
}

const worksheetUrl = new URL("../prisma/verified-catalogue.template.json", import.meta.url);
const outputUrl = new URL("./source-snapshots.json", import.meta.url);
const worksheet = JSON.parse(await readFile(worksheetUrl, "utf8")) as { cards?: CatalogueCard[] };
const snapshots: SourceSnapshot[] = [];

for (const card of worksheet.cards ?? []) {
  if (!card.sourceUrl) {
    snapshots.push({
      cardName: card.cardName,
      bankName: card.bankName,
      sourceUrl: "",
      fetchedAt: new Date().toISOString(),
      status: "error",
      contentHash: null,
      contentLength: 0,
      error: "Missing sourceUrl",
    });
    continue;
  }

  try {
    const response = await fetch(card.sourceUrl, {
      headers: { "User-Agent": "CCR-CatalogueBot/0.1 (maintenance audit)" },
      signal: AbortSignal.timeout(15_000),
    });
    const body = await response.text();
    const contentHash = createHash("sha256").update(body).digest("hex");
    snapshots.push({
      cardName: card.cardName,
      bankName: card.bankName,
      sourceUrl: card.sourceUrl,
      fetchedAt: new Date().toISOString(),
      status: response.status,
      contentHash,
      contentLength: body.length,
      error: response.ok ? null : `HTTP ${response.status}`,
    });
  } catch (error) {
    snapshots.push({
      cardName: card.cardName,
      bankName: card.bankName,
      sourceUrl: card.sourceUrl,
      fetchedAt: new Date().toISOString(),
      status: "error",
      contentHash: null,
      contentLength: 0,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

await mkdir(new URL("./", import.meta.url), { recursive: true });
await writeFile(outputUrl, `${JSON.stringify({ generatedAt: new Date().toISOString(), snapshots }, null, 2)}\n`);

const failed = snapshots.filter((snapshot) => snapshot.status === "error" || (typeof snapshot.status === "number" && snapshot.status >= 400));
console.log(`Fetched ${snapshots.length} source(s); ${failed.length} failed.`);
console.log(`Snapshot written to ${outputUrl.pathname}`);
if (failed.length > 0) process.exitCode = 1;
