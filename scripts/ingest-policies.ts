import * as fs from "fs";
import * as path from "path";
import pdfParse from "pdf-parse";

interface PolicyChunk {
  insurer: string;
  product: string;
  text: string;
}

const POLICIES = [
  {
    insurer: "HDFC ERGO",
    product: "Group Health Insurance",
    url: "https://www.hdfcergo.com/docs/default-source/downloads/policy-wordings/group/group-health-insurance---pw.pdf",
  },
  {
    insurer: "HDFC ERGO",
    product: "Group Assurance Health Plan",
    url: "https://www.hdfcergo.com/docs/default-source/downloads/policy-wordings/group/gahp-pw.pdf",
  },
  {
    insurer: "Niva Bupa",
    product: "Group Health Secure",
    url: "https://transactions.nivabupa.com/pages/doc/policy_wording/group-health-secure-terms-and-conditions.pdf",
  },
  {
    insurer: "Niva Bupa",
    product: "Employ-First",
    url: "https://transactions.nivabupa.com/pages/doc/policy_wording/Employ-FirstPolicyWording.pdf",
  },
  {
    insurer: "Star Health",
    product: "Group Health Insurance",
    url: "https://irdai.gov.in/documents/37343/931203/SHAHLGP21115V012021_2020-2021.pdf",
  },
  {
    insurer: "Bajaj Allianz",
    product: "Health Guard",
    url: "https://www.bajajgeneralinsurance.com/download-documents/health-insurance/health-guard/Health-Guard-Brochure-print.pdf",
  },
];

// ~600 chars per chunk with paragraph-aware splitting
const TARGET_CHUNK_SIZE = 600;
const OVERLAP_WORDS = 20;

function chunkText(text: string): string[] {
  // Normalise whitespace
  const cleaned = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ");

  // Split into paragraphs
  const paras = cleaned
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(p => p.length > 40);

  const chunks: string[] = [];
  let current = "";

  for (const para of paras) {
    if ((current + "\n\n" + para).length <= TARGET_CHUNK_SIZE) {
      current = current ? current + "\n\n" + para : para;
    } else {
      if (current.length > 50) {
        chunks.push(current.trim());
        // carry a few words as overlap
        const words = current.split(" ");
        const tail = words.slice(-OVERLAP_WORDS).join(" ");
        current = tail + "\n\n" + para;
      } else {
        current = para;
      }
    }
  }
  if (current.trim().length > 50) chunks.push(current.trim());

  return chunks;
}

async function fetchPDF(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/pdf,*/*",
      },
    });
    if (!res.ok) {
      console.error(`  HTTP ${res.status} ${res.statusText}`);
      return null;
    }
    return Buffer.from(await res.arrayBuffer());
  } catch (e) {
    console.error(`  Fetch error: ${(e as Error).message}`);
    return null;
  }
}

async function main() {
  const allChunks: PolicyChunk[] = [];

  for (const policy of POLICIES) {
    console.log(`\n▶ ${policy.insurer} — ${policy.product}`);
    console.log(`  ${policy.url}`);

    const buffer = await fetchPDF(policy.url);
    if (!buffer) {
      console.log("  ✗ Skipped (download failed)");
      continue;
    }

    let text: string;
    try {
      const parsed = await pdfParse(buffer);
      text = parsed.text;
      console.log(`  ✓ ${parsed.numpages} pages · ${text.length.toLocaleString()} chars`);
    } catch (e) {
      console.error(`  ✗ Parse failed: ${(e as Error).message}`);
      continue;
    }

    const chunks = chunkText(text);
    console.log(`  → ${chunks.length} chunks`);

    for (const chunk of chunks) {
      allChunks.push({ insurer: policy.insurer, product: policy.product, text: chunk });
    }
  }

  const outDir = path.join(process.cwd(), "data");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "policy-chunks.json");
  fs.writeFileSync(outPath, JSON.stringify(allChunks));

  console.log(`\n✅ Done — ${allChunks.length} total chunks saved to data/policy-chunks.json`);

  // Summary by insurer
  const byInsurer = new Map<string, number>();
  for (const c of allChunks) {
    byInsurer.set(c.insurer, (byInsurer.get(c.insurer) || 0) + 1);
  }
  console.log("\nChunks per insurer:");
  byInsurer.forEach((count, insurer) => console.log(`  ${insurer}: ${count}`));
}

main().catch(console.error);
