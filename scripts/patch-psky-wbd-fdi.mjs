// Targeted patch: fix the PSKY/WBD deal's filings array in live Sanity.
//
// Context: a single entry was previously labeled "Germany & Slovenia / BKartA /
// Cleared / Mar 1, 2026". That conflated two separate jurisdictions AND was
// mis-categorized — both approvals are FDI (national security) clearances,
// not competition merger control, and the agencies are BMWK (Germany) and
// MGTŠ (Slovenia), not BKartA / AVK.
//
// This script finds that filing entry on the live deal and replaces it with
// two accurate FDI entries. It does NOT touch any other fields or deals.
//
// Run: node scripts/patch-psky-wbd-fdi.mjs

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

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;
if (!projectId || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN in .env.local");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-10-01",
  token,
  useCdn: false,
});

function k() {
  return Math.random().toString(36).slice(2, 10);
}

const DEAL_ID = "deal-paramount-skydance-warner-bros-discovery";

const replacements = [
  {
    _key: k(),
    _type: "filing",
    jurisdiction: "FDI",
    display_name: "Germany — BMWK (FDI)",
    outcome: "cleared",
    outcome_summary:
      "German Foreign Direct Investment screening cleared under the AWG/AWV regime by the Federal Ministry for Economic Affairs and Climate Action (BMWK). This is national security / investment-screening review, distinct from merger control (no BKartA filing has been publicly documented).",
    case_url:
      "https://www.prnewswire.com/news-releases/paramount-enhances-its-superior-30-per-share-all-cash-offer-for-warner-bros-discovery-and-provides-update-on-regulatory-progress-302683694.html",
    steps: [
      {
        _key: k(),
        _type: "filing_step",
        label: "FDI clearance (BMWK)",
        actual_date: "2026-01-27",
      },
    ],
  },
  {
    _key: k(),
    _type: "filing",
    jurisdiction: "FDI",
    display_name: "Slovenia — MGTŠ (FDI)",
    outcome: "cleared",
    outcome_summary:
      "Slovenian FDI screening cleared by the Ministry of the Economy, Tourism and Sport (MGTŠ) under the ZSInv regime. Specific clearance date not publicly disclosed; Paramount CSO Andy Gordon confirmed approval on an early-March 2026 investor call. This is national security / investment-screening review, not competition merger control.",
    steps: [
      {
        _key: k(),
        _type: "filing_step",
        label: "FDI clearance publicly confirmed",
        actual_date: "2026-03-03",
        note: "Cleared on or before this date; specific clearance date not publicly disclosed (Paramount CSO Andy Gordon confirmed on investor call)",
      },
    ],
  },
];

async function run() {
  const deal = await client.getDocument(DEAL_ID);
  if (!deal) {
    console.error(`Deal ${DEAL_ID} not found. Aborting.`);
    process.exit(1);
  }
  const filings = Array.isArray(deal.filings) ? deal.filings : [];
  const before = filings.length;

  // Strip out the old combined Germany & Slovenia entry, identified by the
  // BKartA jurisdiction + "Germany & Slovenia" display_name combination.
  const retained = filings.filter(
    (f) =>
      !(
        f.jurisdiction === "BKartA" &&
        (f.display_name === "Germany & Slovenia" ||
          f.display_name === "Germany and Slovenia")
      ),
  );
  const stripped = before - retained.length;

  // Avoid duplicating FDI entries if the script is re-run.
  const alreadyHasFDI = retained.some(
    (f) =>
      f.jurisdiction === "FDI" &&
      typeof f.display_name === "string" &&
      (f.display_name.startsWith("Germany") ||
        f.display_name.startsWith("Slovenia")),
  );

  const nextFilings = alreadyHasFDI ? retained : [...retained, ...replacements];

  console.log(`Deal: ${deal.acquirer} / ${deal.target}`);
  console.log(
    `  Filings before: ${before}, stripped: ${stripped}, added: ${alreadyHasFDI ? 0 : replacements.length}, after: ${nextFilings.length}`,
  );

  if (stripped === 0 && alreadyHasFDI) {
    console.log("Nothing to do — already patched.");
    return;
  }

  await client.patch(DEAL_ID).set({ filings: nextFilings }).commit();
  console.log("✓ Patched.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
