// Targeted patch: split the WTRG/AWK "Other state utility commissions (10+)"
// lumped filing into individual per-state PUC entries.
//
// Idempotent — safe to re-run.
//
// Run: node scripts/patch-wtrg-split-state-pucs.mjs

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

const REQUIRED_STATES = [
  { jurisdiction: "ICC",   summary: "Illinois Commerce Commission — approval required for utility holding company change. Filing required within 60 days post-DMA." },
  { jurisdiction: "KPSC",  summary: "Kentucky Public Service Commission — approval required for utility holding company change. Filing required within 60 days post-DMA." },
  { jurisdiction: "NJBPU", summary: "New Jersey Board of Public Utilities — approval required for utility holding company change. Filing required within 60 days post-DMA." },
  { jurisdiction: "NCUC",  summary: "North Carolina Utilities Commission — approval required for utility holding company change. Filing required within 60 days post-DMA." },
  { jurisdiction: "PUCT",  summary: "Public Utility Commission of Texas — approval required for utility holding company change. Filing required within 60 days post-DMA." },
  { jurisdiction: "VSCC",  summary: "Virginia State Corporation Commission — approval required for utility holding company change. Filing required within 60 days post-DMA." },
];

const NOTIFICATION_STATES = [
  { jurisdiction: "CPUC", summary: "California PUC — notification possible; approval may be required depending on jurisdictional assertion." },
  { jurisdiction: "IURC", summary: "Indiana Utility Regulatory Commission — notification possible; approval may be required depending on jurisdictional assertion." },
  { jurisdiction: "PUCO", summary: "Public Utilities Commission of Ohio — notification possible; approval may be required depending on jurisdictional assertion." },
];

function buildRequiredFiling(row) {
  return {
    _key: k(),
    _type: "filing",
    jurisdiction: row.jurisdiction,
    outcome: "pending",
    outcome_summary: row.summary,
    steps: [
      { _key: k(), _type: "filing_step", label: "Application filing", note: "Within 60 days post-DMA" },
      { _key: k(), _type: "filing_step", label: "Commission decision", note: "Review timelines typically 6-12 months" },
    ],
  };
}

function buildNotificationFiling(row) {
  return {
    _key: k(),
    _type: "filing",
    jurisdiction: row.jurisdiction,
    outcome: "pending",
    outcome_summary: row.summary,
    steps: [
      { _key: k(), _type: "filing_step", label: "Notification / filing (if required)" },
    ],
  };
}

async function run() {
  const deal = await client.fetch(
    `*[_type == "deal" && target == "Essential Utilities"][0]{_id, filings}`,
  );
  if (!deal) {
    console.error("WTRG/AWK deal not found.");
    process.exit(1);
  }

  const filings = Array.isArray(deal.filings) ? deal.filings : [];
  const before = filings.length;

  // Strip the old lumped entry.
  const retained = filings.filter(
    (f) =>
      !(
        f.jurisdiction === "Other" &&
        typeof f.display_name === "string" &&
        f.display_name.toLowerCase().includes("state utility commissions")
      ),
  );
  const stripped = before - retained.length;

  // Avoid duplicating — if the split entries already exist for the required
  // states, treat as already patched.
  const alreadyHas = retained.some((f) => f.jurisdiction === "ICC");

  if (stripped === 0 && alreadyHas) {
    console.log("Already patched — nothing to do.");
    return;
  }

  const nextFilings = alreadyHas
    ? retained
    : [
        ...retained,
        ...REQUIRED_STATES.map(buildRequiredFiling),
        ...NOTIFICATION_STATES.map(buildNotificationFiling),
      ];

  console.log(
    `Filings before: ${before}, stripped: ${stripped}, added: ${alreadyHas ? 0 : REQUIRED_STATES.length + NOTIFICATION_STATES.length}, after: ${nextFilings.length}`,
  );
  await client.patch(deal._id).set({ filings: nextFilings }).commit();
  console.log("✓ WTRG/AWK state PUCs split.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
