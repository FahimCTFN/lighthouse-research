// Targeted patch: convert filings with jurisdiction "Other" + a display_name
// that corresponds to a registered regulator into proper enum-backed entries.
//
// Also splits two remaining multi-regulator lumps:
//   - KVUE/KMB "New Zealand / Australia" → NZCC + ACCC
//   - QRVO/SWKS "FDI screening (9 EU countries + UK)" → 8 per-country cards
//     (no per-country dates — original lumped dates were editor estimates)
//
// AXTA/AKZA's "Other antitrust + FDI (~30 jurisdictions)" is intentionally
// left lumped since no per-jurisdiction detail exists to split on.
//
// Idempotent — safe to re-run.
//
// Run: node scripts/patch-other-jurisdictions.mjs

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

function k() {
  return Math.random().toString(36).slice(2, 10);
}

async function findDeal(match) {
  return client.fetch(`*[_type == "deal" && ${match}][0]{_id, filings}`);
}

async function commitFilings(_id, next) {
  await client.patch(_id).set({ filings: next }).commit();
}

// ── KVUE/KMB: split "New Zealand / Australia" into NZCC + ACCC ──
async function patchKVUE() {
  const deal = await findDeal(`target == "Kenvue"`);
  if (!deal) return console.warn("Skip KVUE/KMB — not found");
  const filings = deal.filings || [];
  if (filings.some((f) => f.jurisdiction === "NZCC")) return console.log("KVUE/KMB: already split");
  const lumped = filings.find(
    (f) => f.jurisdiction === "Other" && f.display_name === "New Zealand / Australia",
  );
  if (!lumped) return console.log("KVUE/KMB: lumped entry already gone");

  const baseSteps = (lumped.steps || []).map((s) => ({ ...s, _key: k() }));
  const baseSummary = lumped.outcome_summary;
  const outcome = lumped.outcome;

  const nzcc = {
    _key: k(),
    _type: "filing",
    jurisdiction: "NZCC",
    outcome,
    outcome_summary:
      "Part of a coordinated NZ/AU review. Companies proposed to divest all of Kenvue's feminine hygiene business in NZ and AU (Kotex vs Stayfree/Carefree) to address competitive overlap.",
    steps: baseSteps.map((s) => ({ ...s, _key: k() })),
  };
  const accc = {
    _key: k(),
    _type: "filing",
    jurisdiction: "ACCC",
    outcome,
    outcome_summary: nzcc.outcome_summary,
    steps: baseSteps.map((s) => ({ ...s, _key: k() })),
  };

  const next = filings.filter((f) => f !== lumped).concat([nzcc, accc]);
  await commitFilings(deal._id, next);
  console.log(`✓ KVUE/KMB split into NZCC + ACCC (preserved dates: ${baseSummary ? "yes" : "na"})`);
}

// ── Generic: rewrite jurisdiction based on display_name prefix ─────────
// Matches are case-insensitive; only applies to filings with jurisdiction "Other".
async function remapOtherByDisplayName(dealMatch, rules, label) {
  const deal = await findDeal(dealMatch);
  if (!deal) return console.warn(`Skip ${label} — not found`);
  const filings = deal.filings || [];
  let changed = false;
  const next = filings.map((f) => {
    if (f.jurisdiction !== "Other" || !f.display_name) return f;
    const rule = rules.find((r) => f.display_name.toLowerCase().startsWith(r.prefix.toLowerCase()));
    if (!rule) return f;
    changed = true;
    const { display_name: _, ...rest } = f; // drop display_name
    return { ...rest, jurisdiction: rule.jurisdiction };
  });
  if (!changed) return console.log(`${label}: already remapped`);
  await commitFilings(deal._id, next);
  console.log(`✓ ${label} remapped`);
}

// ── QRVO/SWKS: KFTC/TFTC remap + split FDI EU lump ─────────────────────
async function patchQRVO() {
  const deal = await findDeal(`target == "Qorvo"`);
  if (!deal) return console.warn("Skip QRVO/SWKS — not found");
  const filings = deal.filings || [];

  // Did we already add the FDI split?
  const alreadySplit = filings.some((f) => f.jurisdiction === "NSIA");
  const kftcAlready = filings.some(
    (f) => f.jurisdiction === "KFTC" && !f.display_name,
  );

  let next = filings;

  // Remap KFTC / TFTC Other → enum
  next = next.map((f) => {
    if (f.jurisdiction !== "Other" || !f.display_name) return f;
    if (f.display_name.startsWith("South Korea")) {
      const { display_name: _, ...rest } = f;
      return { ...rest, jurisdiction: "KFTC" };
    }
    if (f.display_name.startsWith("Taiwan")) {
      const { display_name: _, ...rest } = f;
      return { ...rest, jurisdiction: "TFTC" };
    }
    return f;
  });

  // Split FDI lump
  const lumpedFDI = next.find(
    (f) => f.jurisdiction === "Other" && f.display_name === "FDI screening (9 EU countries + UK)",
  );
  if (lumpedFDI && !alreadySplit) {
    const fdiCards = [
      { jurisdiction: "ISC",  outcome_summary: "FDI / investment screening review (Belgium)." },
      { jurisdiction: "FDI",  display_name: "France — FDI screening",   outcome_summary: "FDI / investment screening review (France)." },
      { jurisdiction: "BMWK", outcome_summary: "FDI / investment screening review (Germany, AWG/AWV regime)." },
      { jurisdiction: "FDI",  display_name: "Ireland — FDI screening",  outcome_summary: "FDI / investment screening review (Ireland)." },
      { jurisdiction: "PCM",  outcome_summary: "FDI / Golden Powers review (Italy)." },
      { jurisdiction: "BTI",  outcome_summary: "FDI / investment screening review (Netherlands)." },
      { jurisdiction: "SFI",  outcome_summary: "FDI / investment screening review (Spain)." },
      { jurisdiction: "NSIA", outcome_summary: "National Security and Investment Act screening (UK)." },
    ].map((c) => ({
      _key: k(),
      _type: "filing",
      outcome: "pending",
      steps: [
        { _key: k(), _type: "filing_step", label: c.jurisdiction === "NSIA" ? "Filing" : "FDI filing" },
        { _key: k(), _type: "filing_step", label: "Decision" },
      ],
      ...c,
    }));
    next = next.filter((f) => f !== lumpedFDI).concat(fdiCards);
  }

  const changed = next !== filings;
  const madeAnyChange = JSON.stringify(next) !== JSON.stringify(filings);
  if (!madeAnyChange && kftcAlready) return console.log("QRVO/SWKS: already patched");
  if (!madeAnyChange) return console.log("QRVO/SWKS: no change needed");
  await commitFilings(deal._id, next);
  console.log(`✓ QRVO/SWKS remapped + FDI split`);
}

async function run() {
  console.log(`Patching live Sanity (${projectId}/${dataset})…`);

  await patchKVUE();

  await remapOtherByDisplayName(
    `target == "AES Corporation"`,
    [
      { prefix: "FERC",  jurisdiction: "FERC" },
      { prefix: "PUCO",  jurisdiction: "PUCO" },
      { prefix: "NYPSC", jurisdiction: "NYPSC" },
      { prefix: "CPUC",  jurisdiction: "CPUC" },
      { prefix: "CEC",   jurisdiction: "CEC" },
    ],
    "AES/GIP",
  );

  await remapOtherByDisplayName(
    `target == "TXNM Energy"`,
    [
      { prefix: "FERC",  jurisdiction: "FERC" },
      { prefix: "PUCT",  jurisdiction: "PUCT" },
      { prefix: "NMPRC", jurisdiction: "NMPRC" },
      { prefix: "NRC",   jurisdiction: "NRC" },
    ],
    "TXNM/BX",
  );

  await patchQRVO();

  await remapOtherByDisplayName(
    `target == "Essential Utilities"`,
    [{ prefix: "Pennsylvania PUC", jurisdiction: "PPUC" }],
    "WTRG/AWK (PPUC)",
  );

  await remapOtherByDisplayName(
    `target == "Clearwater Analytics"`,
    [
      { prefix: "ACCC", jurisdiction: "ACCC" },
      { prefix: "FIRB", jurisdiction: "FIRB" },
    ],
    "CWAN",
  );

  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
