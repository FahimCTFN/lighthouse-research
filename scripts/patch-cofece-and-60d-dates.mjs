// Targeted patch:
// 1. UNP/NSC: change Mexican jurisdiction from "CNA" (historical/alternate name)
//    to "COFECE" (current Comisión Federal de Competencia Económica).
// 2. WTRG/AWK: fill the 60-day-post-DMA "Application filing" note on 5 state
//    PUC filings with the computed calendar date (2025-10-27 + 60d = 2025-12-26)
//    as actual_date, matching how HSR + FCC were already recorded on this deal.
//
// Idempotent. Run: node scripts/patch-cofece-and-60d-dates.mjs

import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-10-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function patchUNP() {
  const deal = await client.fetch(
    `*[_type == "deal" && target == "Norfolk Southern"][0]{_id, filings}`,
  );
  if (!deal) return console.warn("Skip UNP/NSC — not found");
  const filings = deal.filings || [];
  let changed = false;
  const next = filings.map((f) => {
    if (f.jurisdiction === "CNA") {
      changed = true;
      return { ...f, jurisdiction: "COFECE" };
    }
    return f;
  });
  if (!changed) return console.log("UNP/NSC: CNA→COFECE already applied");
  await client.patch(deal._id).set({ filings: next }).commit();
  console.log("✓ UNP/NSC: CNA→COFECE");
}

async function patchWTRG() {
  const deal = await client.fetch(
    `*[_type == "deal" && target == "Essential Utilities"][0]{_id, filings}`,
  );
  if (!deal) return console.warn("Skip WTRG/AWK — not found");
  const filings = deal.filings || [];
  const TARGET_STATES = new Set(["KPSC", "NJBPU", "NCUC", "PUCT", "VSCC"]);
  let changed = false;
  const next = filings.map((f) => {
    if (!TARGET_STATES.has(f.jurisdiction)) return f;
    const steps = f.steps || [];
    const appIdx = steps.findIndex(
      (s) => s.label === "Application filing" && !s.actual_date,
    );
    if (appIdx === -1) return f; // already patched
    changed = true;
    const nextSteps = steps.map((s, i) =>
      i === appIdx
        ? {
            ...s,
            label: "Application filed",
            actual_date: "2025-12-26",
            note: "On or before the 60-day post-DMA deadline (Oct 27, 2025 + 60d)",
          }
        : s,
    );
    return { ...f, steps: nextSteps };
  });
  if (!changed) return console.log("WTRG/AWK: 60-day dates already applied");
  await client.patch(deal._id).set({ filings: next }).commit();
  console.log("✓ WTRG/AWK: 60-day-post-DMA dates filled on state PUCs");
}

async function run() {
  await patchUNP();
  await patchWTRG();
  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
