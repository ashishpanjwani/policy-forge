import * as fs from "fs";
import * as path from "path";
import { BM25Index } from "./bm25";

export interface PolicyChunk {
  insurer: string;
  product: string;
  text: string;
}

const CHUNKS_PATH = path.join(process.cwd(), "data", "policy-chunks.json");

let chunks: PolicyChunk[] = [];
let index: BM25Index | null = null;

function ensureLoaded() {
  if (index !== null) return;

  try {
    const raw = fs.readFileSync(CHUNKS_PATH, "utf-8");
    chunks = JSON.parse(raw) as PolicyChunk[];
  } catch {
    chunks = [];
  }

  index = new BM25Index();
  for (const chunk of chunks) {
    index.add(chunk.text);
  }
  index.build();
}

export function retrieveContext(query: string, k = 8): string {
  ensureLoaded();
  if (chunks.length === 0) return "";

  const topIdx = index!.search(query, k);
  if (topIdx.length === 0) return "";

  const retrieved = topIdx.map(i => chunks[i]);

  // Group by insurer + product so context reads naturally
  const grouped = new Map<string, string[]>();
  for (const chunk of retrieved) {
    const key = `${chunk.insurer} — ${chunk.product}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(chunk.text);
  }

  const parts: string[] = [];
  grouped.forEach((texts, source) => {
    parts.push(`[${source}]\n${texts.join("\n\n")}`);
  });

  return `REAL POLICY CONTEXT (extracted from official insurer policy wordings):\n\n${parts.join("\n\n---\n\n")}`;
}

export function availableInsurers(): string[] {
  ensureLoaded();
  return Array.from(new Set(chunks.map(c => c.insurer)));
}
