// Recompute the stored `next_key_event_*` fields on every deal based on
// current filing/vote step data.
//
// IMPORTANT: this script treats stored fields as MANUAL OVERRIDES — it
// only writes to fields that are currently empty. If an editor has set a
// value in Studio (intentional override), this script leaves it alone.
//
// Use case: after bulk imports / migrations / patches that didn't touch
// next_key_event_*, run this once to populate empty fields. The deal page
// already derives next event at render time, but list/calendar/sort views
// still read the stored fields, so this keeps them fresh.
//
// To force-recompute everything (clearing manual overrides too), pass
// --force.
//
// Run: node scripts/recompute-next-events.mjs [--force]

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

// Mirror of REGULATOR_SHORT but as a plain object since this is .mjs.
// If lib/regulators.ts changes, refresh manually or import via a build step.
const REGULATOR_SHORT = {
  HSR: "HSR", FTC: "FTC", DOJ: "DOJ", FRB: "FRB", OCC: "OCC", FDIC: "FDIC", FINRA: "FINRA",
  FCC: "FCC", DOT: "DOT", FAA: "FAA", NRC: "NRC", FERC: "FERC", STB: "STB",
  CFIUS: "CFIUS", DHS: "DHS", TSA: "TSA",
  State_AG: "State AG", Delaware_SoS: "Delaware SoS",
  CPUC: "CPUC", CEC: "CEC", ICC: "ICC", IURC: "IURC", KPSC: "KPSC", MPSC: "MPSC", NPSC: "NPSC",
  NJBPU: "NJBPU", NMPRC: "NMPRC", NYPSC: "NYPSC", NCUC: "NCUC", PUCO: "PUCO", APSC: "APSC",
  PPUC: "PPUC", SDPUC: "SDPUC", PSCW: "PSCW", PUCT: "PUCT", VSCC: "VSCC",
  CMA: "CMA", FCA: "FCA", PRA: "PRA", NSIA: "NSIA", UK_court: "UK court",
  EC_Merger: "EC", EC_FSR: "EC FSR", ECB: "ECB", COMESA: "COMESA",
  FDI: "FDI",
  CCB: "CCB", IRD_ISED: "IRD-ISED", CMHC: "CMHC", Canada_MoF: "Canada MoF",
  CADE: "CADE", CNA: "CNA", COFECE: "COFECE", IFT: "IFT", ARTF: "ARTF", SCT: "SCT", CNIE: "CNIE",
  FNE: "FNE", INDECOPI: "INDECOPI", PROINVERSION: "PROINVERSIÓN",
  BKartA: "BKartA", BMWK: "BMWK", AWG: "AWG", AWV: "AWV", BaFin: "BaFin",
  CdlC: "CdlC", Minefi: "Minefi", ANFR: "ANFR", ARCEP: "ARCEP",
  AGCM: "AGCM", IPMO: "IPMO", PCM: "PCM", CONSOB: "CONSOB",
  CNMC: "CNMC", SFI: "SFI", FDI_Spain: "FDI Spain", BdE: "BdE", CNMV: "CNMV",
  AdC: "AdC", AFCA: "AFCA", AFMA: "AFMA",
  ComCo: "ComCo", FINMA: "FINMA",
  AFM: "AFM", DCB: "DCB", BTI: "BTI",
  ISC: "ISC", NCA: "NCA", Konkurrensverket: "Konkurrensverket", ISP: "ISP",
  MHSR: "MHSR", MGTS: "MGTŠ",
  UOKiK: "UOKiK", MRiT: "MRiT", RCC: "RCC", CEISD: "CEISD",
  CPC_Cyprus: "CPC", CPC_Serbia: "CPC Serbia", CC_Moldova: "CC", IMA: "IMA",
  AMCU: "AMCU", UkraineInvest: "UkraineInvest",
  Turkey: "TCA", DETE: "DETE", CCPC: "CCPC", CBI: "CBI",
  MFSA: "MFSA", CSSF: "CSSF", CS: "CS", RCJ: "RCJ", JCRA: "JCRA", JFSC: "JFSC",
  GFSC: "GFSC", IOMFSA: "IOMFSA",
  SAMR: "SAMR", JFTC: "JFTC", FEFTA: "FEFTA", JFSA: "FSA",
  KFTC: "KFTC", TFTC: "TFTC",
  CCI: "CCI", SEBI: "SEBI", CCCS: "CCCS", MAS: "MAS", MyCC: "MyCC",
  KPPU: "KPPU", OTCC: "OTCC", PCC: "PCC", VCC: "VCC", VCCA: "VCCA",
  ACCC: "ACCC", ASIC: "ASIC", FIRB: "FIRB", ASX: "ASX",
  NZCC: "NZCC", OIO: "OIO", ICCC: "ICCC", SFC: "SFC",
  Court: "Court", Shareholder: "Vote", Other: "Other",
};

const COMPLETED_FILING_OUTCOMES = new Set([
  "cleared",
  "cleared_with_remedies",
  "blocked",
  "withdrawn",
]);
const COMPLETED_VOTE_OUTCOMES = new Set([
  "approved",
  "rejected",
  "not_required",
]);

function todayISO() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function regShort(jurisdiction, displayName) {
  if (displayName) return displayName;
  return REGULATOR_SHORT[jurisdiction] ?? jurisdiction;
}

function deriveNextKeyEvent(deal) {
  const today = todayISO();
  const candidates = [];

  for (const f of deal.filings ?? []) {
    if (COMPLETED_FILING_OUTCOMES.has(f.outcome)) continue;
    for (const s of f.steps ?? []) {
      if (s.actual_date) continue;
      if (!s.expected_date || s.expected_date < today) continue;
      candidates.push({
        date: s.expected_date,
        label: `${regShort(f.jurisdiction, f.display_name)} — ${s.label}`,
      });
    }
  }
  for (const v of deal.shareholder_votes ?? []) {
    if (v.outcome && COMPLETED_VOTE_OUTCOMES.has(v.outcome)) continue;
    for (const s of v.steps ?? []) {
      if (s.actual_date) continue;
      if (!s.expected_date || s.expected_date < today) continue;
      candidates.push({ date: s.expected_date, label: s.label });
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => a.date.localeCompare(b.date));
    return candidates[0];
  }

  if (deal.ctfn_estimated_close && deal.ctfn_estimated_close >= today) {
    return { date: deal.ctfn_estimated_close, label: "Estimated close" };
  }
  return null;
}

async function run() {
  const force = process.argv.includes("--force");

  const deals = await client.fetch(
    `*[_type == "deal" && status in ["pre_event", "ongoing"]]{
      _id, target, acquirer,
      next_key_event_date, next_key_event_label, ctfn_estimated_close,
      filings[]{ jurisdiction, display_name, outcome, steps[]{ label, expected_date, actual_date } },
      shareholder_votes[]{ outcome, steps[]{ label, expected_date, actual_date } }
    }`,
  );

  console.log(
    `Recomputing next_key_event for ${deals.length} active deals${force ? " (--force: overwriting manual overrides)" : " (skipping deals with manual overrides set)"}…\n`,
  );
  let updated = 0;
  let skipped = 0;
  for (const d of deals) {
    const hasOverride = !!(d.next_key_event_date && d.next_key_event_label);
    if (hasOverride && !force) {
      console.log(
        `· ${d.target}: manual override set (${d.next_key_event_label}, ${d.next_key_event_date}) — skipped`,
      );
      skipped++;
      continue;
    }

    const next = deriveNextKeyEvent(d);
    const sameDate = d.next_key_event_date === (next?.date ?? null);
    const sameLabel = d.next_key_event_label === (next?.label ?? null);
    if (sameDate && sameLabel) {
      console.log(`· ${d.target}: already matches derived (${next?.label ?? "—"})`);
      continue;
    }

    const op = client.patch(d._id);
    if (next) {
      op.set({
        next_key_event_date: next.date,
        next_key_event_label: next.label,
      });
    } else {
      op.unset(["next_key_event_date", "next_key_event_label"]);
    }
    await op.commit();

    const after = next ? `${next.label} (${next.date})` : "—";
    console.log(`✓ ${d.target}: → ${after}`);
    updated++;
  }

  console.log(
    `\nDone — ${updated} deal(s) updated, ${skipped} deal(s) skipped (manual override).`,
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
