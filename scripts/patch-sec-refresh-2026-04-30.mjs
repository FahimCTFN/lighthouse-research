// SEC-filing refresh as of 2026-04-30. Applies material findings from three
// parallel research passes over EDGAR. Idempotent.
//
// Run: node scripts/patch-sec-refresh-2026-04-30.mjs

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

async function setOnDeal(_id, patches) {
  if (!Object.keys(patches).length) return false;
  await client.patch(_id).set(patches).commit();
  return true;
}

// ── SLAB/TXN: vote PASSED Apr 30 ─────────────────────────────────────────
async function patchSLAB() {
  const deal = await client.fetch(
    `*[_type == "deal" && target == "Silicon Labs"][0]`,
  );
  if (!deal) return console.warn("SLAB not found");
  const votes = deal.shareholder_votes || [];
  let changed = false;
  const next = votes.map((v) => {
    if (v.party !== "target" || v.outcome === "approved") return v;
    changed = true;
    const steps = (v.steps || []).map((s) => ({ ...s, _key: k() }));
    let voteStepUpdated = false;
    const updated = steps.map((s) => {
      if (s.label === "Shareholder vote" && !s.actual_date) {
        voteStepUpdated = true;
        return {
          ...s,
          label: "Shareholder vote — passed",
          actual_date: "2026-04-30",
          expected_date: undefined,
          note: "25,878,105 FOR / 7,467 AGAINST / 1,570 abstain (>99.97% approval). Quorum 78.52% (25,887,142 of 32,968,416 shares).",
        };
      }
      return s;
    });
    return {
      ...v,
      outcome: "approved",
      label: "Silicon Labs shareholders — approved April 30, 2026",
      outcome_summary:
        "Silicon Labs shareholders approved the merger on April 30, 2026 with overwhelming support. 25,878,105 FOR / 7,467 AGAINST / 1,570 abstain (>99.97% of votes cast). Quorum 78.52%. Say-on-Golden-Parachute also approved (24.77mn FOR / 974k AGAINST).",
      steps: voteStepUpdated ? updated : updated,
    };
  });
  if (!changed) return console.log("· SLAB vote already approved");
  await client.patch(deal._id).set({ shareholder_votes: next }).commit();
  console.log("✓ SLAB/TXN: shareholder vote → approved with detailed counts");
}

// ── PSKY/WBD: refine vote counts; tighten quorum detail ──────────────────
async function patchPSKY() {
  const deal = await client.fetch(
    `*[_type == "deal" && target == "Warner Bros. Discovery"][0]`,
  );
  if (!deal) return console.warn("PSKY/WBD not found");
  const votes = deal.shareholder_votes || [];
  const NEW_NOTE =
    "1,742,843,087 FOR / 16,260,135 AGAINST / 2,371,121 abstain (>99% approval). Quorum 70.3% (1,761,474,343 of 2,506,768,389 shares present). Advisory comp vote rejected — does not block close.";
  const NEW_SUMMARY =
    "WBD shareholders approved the merger on April 23, 2026 with overwhelming support — 1,742,843,087 FOR vs 16,260,135 AGAINST (>99% approval, 70.3% quorum). Advisory vote on Zaslav's $886mn compensation package was rejected (>1.4bn against, 307.7mn for) but does not block the merger. Stockholder litigation (Donna Nicosia v. Di Piazza et al., NY Sup. Ct., Apr 2) was mooted via supplemental disclosures.";
  let changed = false;
  const next = votes.map((v) => {
    if (v.party !== "target") return v;
    if (v.outcome_summary === NEW_SUMMARY) return v;
    changed = true;
    const steps = (v.steps || []).map((s) => {
      if (s.label && s.label.includes("passed")) {
        return { ...s, _key: k(), note: NEW_NOTE };
      }
      return { ...s, _key: k() };
    });
    return { ...v, outcome_summary: NEW_SUMMARY, steps };
  });
  if (!changed) return console.log("· PSKY/WBD vote already enriched");
  await client.patch(deal._id).set({ shareholder_votes: next }).commit();
  console.log("✓ PSKY/WBD: vote counts refined + litigation note");
}

// ── WTRG/AWK: confirm close guidance + KPSC SEC source ──────────────────
async function patchWTRG() {
  const deal = await client.fetch(
    `*[_type == "deal" && target == "Essential Utilities"][0]`,
  );
  if (!deal) return console.warn("WTRG not found");
  const patches = {};
  if (deal.ctfn_estimated_close !== "2027-03-31") {
    patches.ctfn_estimated_close = "2027-03-31";
  }
  // Refresh KPSC outcome_summary to add SEC source
  const filings = deal.filings || [];
  let filingsChanged = false;
  const nextFilings = filings.map((f) => {
    if (f.jurisdiction !== "KPSC") return f;
    const NEW_SUMMARY =
      "Kentucky PSC approved the merger on April 22, 2026 — the first regulatory approval for the transaction. Confirmed via SEC 8-K (Item 7.01) and AWK 425 filing. Companies reaffirmed close target: end of Q1 2027.";
    if (f.outcome_summary === NEW_SUMMARY) return f;
    filingsChanged = true;
    return { ...f, outcome_summary: NEW_SUMMARY };
  });
  if (filingsChanged) patches.filings = nextFilings;

  if (await setOnDeal(deal._id, patches)) console.log("✓ WTRG/AWK: KPSC summary + close guidance");
  else console.log("· WTRG/AWK: already up to date");
}

// ── KVUE/KMB: CFO transition (Kenvue) ────────────────────────────────────
async function patchKVUE() {
  const deal = await client.fetch(
    `*[_type == "deal" && target == "Kenvue"][0]`,
  );
  if (!deal) return console.warn("KVUE not found");
  const krs = deal.key_risk_summary || "";
  if (krs.includes("CFO Banati")) return console.log("· KVUE CFO note already added");
  const NEW_KRS =
    krs +
    " | Kenvue CFO Amit Banati stepping down effective May 12, 2026; Heather Howlett (CAO) appointed interim CFO — material executive transition mid-deal (per SEC 8-K Item 5.02, Apr 15).";
  await client.patch(deal._id).set({ key_risk_summary: NEW_KRS }).commit();
  console.log("✓ KVUE/KMB: CFO transition added to key_risk_summary");
}

// ── SKYT/IonQ: SEC URL for FTC Second Request step ───────────────────────
async function patchSKYT() {
  const deal = await client.fetch(
    `*[_type == "deal" && target == "SkyWater Technology"][0]`,
  );
  if (!deal) return console.warn("SKYT not found");
  const filings = deal.filings || [];
  let changed = false;
  const next = filings.map((f) => {
    if (f.jurisdiction !== "HSR") return f;
    if (f.case_url) return f;
    changed = true;
    return {
      ...f,
      case_url:
        "https://www.sec.gov/Archives/edgar/data/1819974/000119312526177666/d207058d8k.htm",
    };
  });
  if (!changed) return console.log("· SKYT HSR case_url already set");
  await client.patch(deal._id).set({ filings: next }).commit();
  console.log("✓ SKYT/IonQ: HSR case_url → SkyWater 8-K disclosing Second Request");
}

// ── NSC: Q1 transaction cost data point in deck ──────────────────────────
async function patchNSC() {
  const deal = await client.fetch(
    `*[_type == "deal" && target == "Norfolk Southern"][0]`,
  );
  if (!deal) return console.warn("NSC not found");
  const krs = deal.key_risk_summary || "";
  if (krs.includes("$52mn")) return console.log("· NSC transaction cost already noted");
  const NEW_KRS =
    krs +
    " | NSC reported $52mn in Q1 2026 merger-related expenses (10-Q, Apr 24, 2026) — employee retention, advisor fees, legal.";
  await client.patch(deal._id).set({ key_risk_summary: NEW_KRS }).commit();
  console.log("✓ UNP/NSC: Q1 transaction-cost data point added");
}

async function run() {
  console.log("SEC refresh patch — 2026-04-30\n");
  await patchSLAB();
  await patchPSKY();
  await patchWTRG();
  await patchKVUE();
  await patchSKYT();
  await patchNSC();
  console.log("\nDone.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
