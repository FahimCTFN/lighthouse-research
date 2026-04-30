// Add the ACCC filing to PSKY/WBD.
// Source: https://www.accc.gov.au/public-registers/mergers-and-acquisitions-registers/acquisitions-register/paramount-skydance-warner-bros-discovery
//
// Idempotent. Run: node scripts/patch-psky-add-accc.mjs

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

const k = () => Math.random().toString(36).slice(2, 10);

async function run() {
  const deal = await client.fetch(
    `*[_type == "deal" && target == "Warner Bros. Discovery"][0]`,
  );
  if (!deal) return console.warn("PSKY/WBD not found");

  const filings = deal.filings || [];
  if (filings.some((f) => f.jurisdiction === "ACCC")) {
    return console.log("· PSKY/WBD ACCC already present");
  }

  const accc = {
    _key: k(),
    _type: "filing",
    jurisdiction: "ACCC",
    outcome: "pending",
    outcome_summary:
      "ACCC notified April 29, 2026 (case MN-45006). Phase 1 initial assessment underway. End of determination period: June 12, 2026. Submissions deadline: May 7, 2026.",
    case_url:
      "https://www.accc.gov.au/public-registers/mergers-and-acquisitions-registers/acquisitions-register/paramount-skydance-warner-bros-discovery",
    steps: [
      {
        _key: k(),
        _type: "filing_step",
        label: "Notification filed (case MN-45006)",
        actual_date: "2026-04-29",
      },
      {
        _key: k(),
        _type: "filing_step",
        label: "Submissions deadline",
        expected_date: "2026-05-07",
      },
      {
        _key: k(),
        _type: "filing_step",
        label: "Phase 1 determination",
        expected_date: "2026-06-12",
      },
    ],
  };

  const next = [...filings, accc];
  await client.patch(deal._id).set({ filings: next }).commit();
  console.log("✓ PSKY/WBD: ACCC filing added");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
