// Targeted patch: add verified regulator case-page / press-release URLs to
// existing filings. Only touches filings whose jurisdiction matches the
// target on the expected deal. Idempotent — safe to re-run.
//
// Verified via three research agents on 2026-04-21. Only URLs confirmed to
// load and reference the specific deal are included; everything else was
// returned "not found" and deliberately left blank.
//
// Run: node scripts/patch-regulator-urls.mjs

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
  console.error("Missing env");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-10-01",
  token,
  useCdn: false,
});

// Each entry: identify the deal by target, then set case_url on the filing
// matching `jurisdiction` (and optionally display_name as a disambiguator).
const URL_UPDATES = [
  {
    target: "Warner Bros. Discovery",
    jurisdiction: "State_AG",
    display_name: "California Attorney General",
    case_url:
      "https://oag.ca.gov/news/press-releases/attorney-general-bonta-issues-statement-proposed-warner-bros-mergers-california",
  },
  {
    target: "Kenvue",
    jurisdiction: "NZCC",
    case_url:
      "https://comcom.govt.nz/case-register/case-register-entries/kimberly-clark-corporation-and-kenvue-inc",
  },
  {
    target: "TXNM Energy",
    jurisdiction: "FERC",
    case_url:
      "https://www.prnewswire.com/news-releases/ferc-authorizes-txnm-energy-acquisition-by-blackstone-infrastructure-finds-transaction-consistent-with-public-interest-302693942.html",
    outcome_summary:
      "FERC Section 203 authorization granted February 20, 2026 — docket EC25-140-000.",
  },
  {
    target: "TXNM Energy",
    jurisdiction: "PUCT",
    case_url:
      "https://tnmp.com/about-us/news-media/texas-approves-txnm-energys-acquisition-blackstone-infrastructure",
  },
  {
    target: "TXNM Energy",
    jurisdiction: "NMPRC",
    case_url: "https://www.prc.nm.gov/pnm_acquisition_case_information/",
  },
  {
    target: "Essential Utilities",
    jurisdiction: "PPUC",
    case_url: "https://www.puc.pa.gov/docket/A-2025-3058927",
  },
  {
    target: "Essential Utilities",
    jurisdiction: "ICC",
    case_url: "https://www.icc.illinois.gov/docket/P2025-1057",
    outcome_summary:
      "Illinois docket 25-1057 — Application for Approval of Reorganization filed December 5, 2025.",
  },
  {
    target: "Essential Utilities",
    jurisdiction: "VSCC",
    case_url:
      "https://www.scc.virginia.gov/case-information/submit-public-comments/cases/pur-2025-00229-.html",
    outcome_summary:
      "Virginia SCC case PUR-2025-00229 — joint petition of American Water Works, Alpha Merger Sub, Essential Utilities, and Aqua Virginia.",
  },
];

async function run() {
  console.log(`Adding verified case_url values to ${URL_UPDATES.length} filings…`);

  for (const u of URL_UPDATES) {
    const deal = await client.fetch(
      `*[_type == "deal" && target == $target][0]{_id, filings}`,
      { target: u.target },
    );
    if (!deal) {
      console.warn(`  ⚠  ${u.target} — deal not found`);
      continue;
    }
    const filings = deal.filings || [];
    let changed = false;
    const next = filings.map((f) => {
      if (f.jurisdiction !== u.jurisdiction) return f;
      if (u.display_name && f.display_name !== u.display_name) return f;
      if (f.case_url === u.case_url && (!u.outcome_summary || f.outcome_summary === u.outcome_summary)) {
        return f;
      }
      changed = true;
      const patch = { ...f, case_url: u.case_url };
      if (u.outcome_summary) patch.outcome_summary = u.outcome_summary;
      return patch;
    });
    if (!changed) {
      console.log(`  ·  ${u.target} / ${u.jurisdiction} — already up to date`);
      continue;
    }
    await client.patch(deal._id).set({ filings: next }).commit();
    console.log(`  ✓  ${u.target} / ${u.jurisdiction}`);
  }

  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
