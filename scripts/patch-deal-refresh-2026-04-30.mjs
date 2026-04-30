// Targeted refresh: apply material developments researched on April 30, 2026.
//
// Each deal is patched independently, with idempotency checks so the script
// is safe to re-run. All sources cited in commit message.
//
// Run: node scripts/patch-deal-refresh-2026-04-30.mjs

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

async function getDeal(target) {
  return client.fetch(
    `*[_type == "deal" && target == $target][0]`,
    { target },
  );
}

async function setOnDeal(_id, patches) {
  if (!Object.keys(patches).length) return false;
  await client.patch(_id).set(patches).commit();
  return true;
}

// ── PSKY/WBD: shareholder vote approved Apr 23 + FCC + EC FSR + next_event ──
async function patchPSKY() {
  const deal = await getDeal("Warner Bros. Discovery");
  if (!deal) return console.warn("PSKY/WBD not found");
  const patches = {};

  // 1. Shareholder vote: pending → approved with actual date
  const votes = deal.shareholder_votes || [];
  let votesChanged = false;
  const nextVotes = votes.map((v) => {
    if (v.party !== "target" || v.outcome === "approved") return v;
    votesChanged = true;
    const steps = (v.steps || []).map((s) => ({ ...s, _key: k() }));
    if (!steps.some((s) => s.label === "Vote passed")) {
      steps.push({
        _key: k(),
        _type: "filing_step",
        label: "Vote passed",
        actual_date: "2026-04-23",
        note: "~1.743bn shares FOR vs ~16.3mn AGAINST. Advisory comp vote rejected ($886mn parachute) — does not block close.",
      });
    }
    return {
      ...v,
      outcome: "approved",
      label: "WBD shareholders — approved April 23, 2026",
      outcome_summary:
        "WBD shareholders approved the merger with overwhelming support (~1.743bn FOR vs ~16.3mn AGAINST). Advisory vote on Zaslav's $886mn compensation package was rejected (>1.4bn against, 307.7mn for) but does not block the merger.",
      steps,
    };
  });
  if (votesChanged) patches.shareholder_votes = nextVotes;

  // 2. Filings: add FCC declaratory ruling petition + refresh EC FSR + CMA
  const filings = deal.filings || [];
  let filingsChanged = false;
  let nextFilings = [...filings];

  // Refresh EC_FSR with new RFI note
  nextFilings = nextFilings.map((f) => {
    if (f.jurisdiction !== "EC_FSR") return f;
    const newSummary =
      "FSR clearance required due to backing from PIF (Saudi), QIA (Qatar), and L'imad Holding (Abu Dhabi). EC issued additional RFIs on sovereign-wealth subsidies in late April 2026. Pre-notification ongoing.";
    if (f.outcome_summary === newSummary) return f;
    filingsChanged = true;
    return { ...f, outcome_summary: newSummary };
  });

  // Refresh CMA with comment-period-closed update
  nextFilings = nextFilings.map((f) => {
    if (f.jurisdiction !== "CMA") return f;
    const updated = (f.outcome_summary || "").includes("Comment period closed");
    if (updated) return f;
    filingsChanged = true;
    const steps = (f.steps || []).map((s) => ({ ...s, _key: k() }));
    if (!steps.some((s) => s.label === "Comment period closed")) {
      steps.push({
        _key: k(),
        _type: "filing_step",
        label: "Comment period closed",
        actual_date: "2026-04-27",
      });
    }
    return {
      ...f,
      outcome_summary:
        "CMA opened case April 13 and invited public comment. Comment period closed April 27, 2026. Phase 1 investigation expected to commence shortly. Analysts expect straightforward Phase 1 clearance — combined market share below 20% in UK.",
      steps,
    };
  });

  // Add FCC foreign ownership petition (new)
  if (!nextFilings.some((f) => f.jurisdiction === "FCC")) {
    filingsChanged = true;
    nextFilings.push({
      _key: k(),
      _type: "filing",
      jurisdiction: "FCC",
      outcome: "pending",
      outcome_summary:
        "Paramount filed a Petition for Declaratory Ruling with the FCC on April 27, 2026, seeking pre-approval for the foreign backers (PIF, QIA, L'imad) to potentially raise equity/voting up to 20% in the future.",
      case_url:
        "https://www.bloomberg.com/news/articles/2026-04-27/paramount-asks-fcc-to-bless-foreign-funding-in-warner-bros-deal",
      steps: [
        {
          _key: k(),
          _type: "filing_step",
          label: "Petition for declaratory ruling on foreign ownership filed",
          actual_date: "2026-04-27",
        },
        { _key: k(), _type: "filing_step", label: "FCC decision" },
      ],
    });
  }

  if (filingsChanged) patches.filings = nextFilings;

  // 3. next_key_event — vote already happened, advance
  if (deal.next_key_event_date === "2026-04-23") {
    patches.next_key_event_date = "2026-07-01";
    patches.next_key_event_label = "EC merger control Phase 1 decision (target)";
  }

  // 4. deck — vote happened
  if ((deal.deck || "").includes("Shareholder vote in")) {
    patches.deck =
      "Shareholder vote PASSED April 23 (1.743bn FOR vs 16.3mn AGAINST). Comp package rejected on advisory vote — doesn't block close. California AG investigation remains the primary live risk.";
  }

  if (await setOnDeal(deal._id, patches)) console.log("✓ PSKY/WBD updated");
  else console.log("· PSKY/WBD: nothing to change");
}

// ── CWAN: EC cleared Apr 22 ──────────────────────────────────────────────
async function patchCWAN() {
  const deal = await getDeal("Clearwater Analytics");
  if (!deal) return console.warn("CWAN not found");
  const filings = deal.filings || [];
  let changed = false;
  const next = filings.map((f) => {
    if (f.jurisdiction !== "EC_Merger") return f;
    if (f.outcome === "cleared") return f;
    changed = true;
    const steps = (f.steps || []).map((s) => ({ ...s, _key: k() }));
    if (!steps.some((s) => s.label === "EC clearance")) {
      steps.push({
        _key: k(),
        _type: "filing_step",
        label: "EC clearance",
        actual_date: "2026-04-22",
        note: "Non-opposition decision under simplified procedure",
      });
    }
    return {
      ...f,
      outcome: "cleared",
      outcome_summary:
        "EC cleared the merger on April 22, 2026 under the simplified procedure (case M.12339), well ahead of the May 6 Phase I deadline.",
      steps,
    };
  });
  if (!changed) return console.log("· CWAN: EC already cleared");
  await client.patch(deal._id).set({ filings: next }).commit();
  console.log("✓ CWAN: EC merger control marked cleared");
}

// ── SKYT/IonQ: FTC Second Request issued Apr 24 ──────────────────────────
async function patchSKYT() {
  const deal = await getDeal("SkyWater Technology");
  if (!deal) return console.warn("SKYT not found");
  const patches = {};
  const filings = deal.filings || [];
  let changed = false;
  const next = filings.map((f) => {
    if (f.jurisdiction !== "HSR") return f;
    const summary = f.outcome_summary || "";
    if (summary.includes("Second Request")) return f;
    changed = true;
    const steps = (f.steps || []).map((s) => ({ ...s, _key: k() }));
    steps.push({
      _key: k(),
      _type: "filing_step",
      label: "FTC Second Request issued",
      actual_date: "2026-04-24",
      note: "HSR waiting period extended; runs 30 days after substantial compliance with Second Request — typically adds 6+ months to review.",
    });
    return {
      ...f,
      outcome: "conditional",
      outcome_summary:
        "FTC issued a Second Request on April 24, 2026 — major escalation. HSR waiting period extended pending substantial compliance. Companies still publicly guide to Q2/Q3 2026 close, but Second Request typically adds 6+ months to review timelines.",
      steps,
    };
  });
  if (changed) patches.filings = next;

  // Advance next_key_event from "HSR expiration" Apr 24 to shareholder vote May 8
  if (deal.next_key_event_date === "2026-04-24") {
    patches.next_key_event_date = "2026-05-08";
    patches.next_key_event_label = "Target shareholder vote";
  }

  if (await setOnDeal(deal._id, patches)) console.log("✓ SKYT/IonQ updated");
  else console.log("· SKYT/IonQ: nothing to change");
}

// ── UNP/NSC: STB refiling submitted Apr 30 ───────────────────────────────
async function patchUNP() {
  const deal = await getDeal("Norfolk Southern");
  if (!deal) return console.warn("UNP/NSC not found");
  const patches = {};
  const filings = deal.filings || [];
  let changed = false;
  const next = filings.map((f) => {
    if (f.jurisdiction !== "STB") return f;
    const steps = (f.steps || []).map((s) => ({ ...s, _key: k() }));
    let stepChanged = false;
    const updated = steps.map((s) => {
      if (s.label === "Application refiling" && !s.actual_date) {
        stepChanged = true;
        return { ...s, actual_date: "2026-04-30", expected_date: undefined };
      }
      return s;
    });
    if (!stepChanged) return f;
    changed = true;
    if (!updated.some((s) => s.label === "STB completeness determination")) {
      updated.push({
        _key: k(),
        _type: "filing_step",
        label: "STB completeness determination",
        note: "Typically 30-60 days after refiling",
      });
    }
    return {
      ...f,
      outcome_summary:
        "First Class I merger tested under the STB's 2001 enhance-competition standard. Application initially rejected as incomplete in January. Amended merger application refiled April 30, 2026 — UP described it as 'the most thorough assessment of market and operational impacts ever' with multi-year market projections, full data/methodology disclosure, and a complete standalone application addressing the three deficiencies STB cited.",
      steps: updated,
    };
  });
  if (changed) patches.filings = next;

  // Advance next_key_event
  if (deal.next_key_event_date === "2026-04-30") {
    patches.next_key_event_label = "STB completeness determination";
    patches.next_key_event_date = "2026-06-15";
  }

  if (await setOnDeal(deal._id, patches)) console.log("✓ UNP/NSC updated");
  else console.log("· UNP/NSC: nothing to change");
}

// ── WTRG/AWK: KPSC approved Apr 22 + ICC CUB opposition + PPUC hearings ──
async function patchWTRG() {
  const deal = await getDeal("Essential Utilities");
  if (!deal) return console.warn("WTRG/AWK not found");
  const patches = {};
  const filings = deal.filings || [];
  let changed = false;

  let next = filings.map((f) => {
    // KPSC approved Apr 22
    if (f.jurisdiction === "KPSC" && f.outcome !== "cleared") {
      changed = true;
      const steps = (f.steps || []).map((s) => ({ ...s, _key: k() }));
      if (!steps.some((s) => s.label === "KPSC approval granted")) {
        steps.push({
          _key: k(),
          _type: "filing_step",
          label: "KPSC approval granted",
          actual_date: "2026-04-22",
          note: "First regulatory approval received for the merger.",
        });
      }
      return {
        ...f,
        outcome: "cleared",
        outcome_summary:
          "Kentucky PSC approved the merger on April 22, 2026 — the first regulatory approval for the transaction.",
        case_url:
          "https://newsroom.amwater.com/2026-04-22-American-Water-and-Essential-Utilities-Receive-Kentucky-Public-Service-Commission-Approval-for-Proposed-Merger",
        steps,
      };
    }

    // ICC: add CUB adverse testimony Apr 9, deepen risk language
    if (f.jurisdiction === "ICC") {
      const summary = f.outcome_summary || "";
      if (summary.includes("CUB filed adverse testimony")) return f;
      changed = true;
      const steps = (f.steps || []).map((s) => ({ ...s, _key: k() }));
      if (!steps.some((s) => s.label === "CUB adverse testimony filed")) {
        // Insert before the final "Commission decision" step
        const decIdx = steps.findIndex((s) => s.label === "Commission decision");
        const newStep = {
          _key: k(),
          _type: "filing_step",
          label: "CUB adverse testimony filed",
          actual_date: "2026-04-09",
          note:
            "Citizens Utility Board witness Bradley Cebulko argued insufficient public-interest evidence, excessive consolidation (>99.99% of IL regulated water customers), and recommended a 5-year acquisition moratorium if approved.",
        };
        if (decIdx >= 0) steps.splice(decIdx, 0, newStep);
        else steps.push(newStep);
        // Update decision deadline note if present
        const decision = steps.find((s) => s.label === "Commission decision");
        if (decision) {
          decision.expected_date = "2026-11-05";
          decision.note = "ICC ruling deadline";
        }
      }
      return {
        ...f,
        outcome_summary:
          "Illinois docket 25-1057 — Application for Approval of Reorganization filed December 5, 2025. CUB filed adverse testimony April 9, 2026 opposing the merger; ICC ruling deadline November 5, 2026.",
        steps,
      };
    }

    // PPUC: add public input hearings + tighten outcome_summary
    if (f.jurisdiction === "PPUC") {
      const summary = f.outcome_summary || "";
      if (summary.includes("Public input hearings underway")) return f;
      changed = true;
      const steps = (f.steps || []).map((s) => ({ ...s, _key: k() }));
      const additions = [
        { label: "Public input hearings — Lackawanna County", actual_date: "2026-04-30" },
        { label: "Public input hearings — Montgomery County", expected_date: "2026-05-05" },
        { label: "Public input hearings — Clarion County (PennWest)", expected_date: "2026-05-07" },
      ];
      for (const a of additions) {
        if (steps.some((s) => s.label === a.label)) continue;
        steps.push({
          _key: k(),
          _type: "filing_step",
          ...a,
        });
      }
      // Sort steps roughly by date (preserve existing order otherwise)
      return {
        ...f,
        outcome_summary:
          "Pennsylvania is the central review (docket A-2025-3058927). Public input hearings underway across the state. Parties seeking to have proceedings concluded in Q3 2026; PPUC decision target September 24, 2026.",
        steps,
      };
    }

    return f;
  });

  if (changed) patches.filings = next;

  // Update key_risk_summary to elevate IL contested
  const krs = deal.key_risk_summary || "";
  if (!krs.includes("Illinois CUB")) {
    patches.key_risk_summary =
      "Pennsylvania PUC central review is the critical path. Illinois CUB filed adverse expert testimony April 9 opposing the merger and recommending a 5-year acquisition moratorium — Illinois has emerged as a meaningfully contested approval. 10+ state utility commissions create multi-jurisdictional complexity. All-stock structure removes financing risk.";
  }

  if (await setOnDeal(deal._id, patches)) console.log("✓ WTRG/AWK updated");
  else console.log("· WTRG/AWK: nothing to change");
}

// ── TXNM/BX: NMPRC procedural updates ────────────────────────────────────
async function patchTXNM() {
  const deal = await getDeal("TXNM Energy");
  if (!deal) return console.warn("TXNM not found");
  const patches = {};
  const filings = deal.filings || [];
  let changed = false;

  const next = filings.map((f) => {
    if (f.jurisdiction !== "NMPRC") return f;
    const steps = (f.steps || []).map((s) => ({ ...s, _key: k() }));
    let stepChanged = false;

    // Convert "Public hearing on PIPE" expected → actual_date
    for (const s of steps) {
      if (s.label === "Public hearing on PIPE" && !s.actual_date) {
        s.actual_date = "2026-04-30";
        s.expected_date = undefined;
        s.note = "Show-cause evidentiary hearing held; hearing examiners will issue written decision (no bench ruling)";
        stepChanged = true;
      }
    }

    // Add new procedural events if not present
    const additions = [
      { label: "Joint Applicants' show-cause brief filed", actual_date: "2026-04-06" },
      { label: "Intervenor responsive briefs filed", actual_date: "2026-04-20" },
    ];
    for (const a of additions) {
      if (!steps.some((s) => s.label === a.label)) {
        steps.unshift({ _key: k(), _type: "filing_step", ...a });
        stepChanged = true;
      }
    }

    // Add scheduling conference May 6 if not present
    if (!steps.some((s) => s.label === "Scheduling conference for revised procedural schedule")) {
      steps.push({
        _key: k(),
        _type: "filing_step",
        label: "Scheduling conference for revised procedural schedule",
        expected_date: "2026-05-06",
        note: "NMPRC will issue revised schedule for main acquisition case by May 8, 2026",
      });
      stepChanged = true;
    }

    if (!stepChanged) return f;
    changed = true;
    return {
      ...f,
      outcome_summary:
        "Primary remaining regulatory risk (case 25-00060-UT). Hearing examiners opened investigation into Blackstone's $400mn PIPE on March 11. Joint Applicants filed show-cause brief April 6; intervenors filed responsive briefs April 20. Show-cause evidentiary hearing held April 30, 2026 — written decision pending. Scheduling conference May 6 will set revised procedural schedule for the main case. NM AG Raúl Torrez is challenging the PIPE; 16 NM lawmakers signed an opposition letter.",
      steps,
    };
  });
  if (changed) patches.filings = next;

  if (deal.next_key_event_date === "2026-04-30") {
    patches.next_key_event_date = "2026-05-06";
    patches.next_key_event_label = "NMPRC scheduling conference";
  }

  if (await setOnDeal(deal._id, patches)) console.log("✓ TXNM updated");
  else console.log("· TXNM: nothing to change");
}

// ── AES/GIP: correct April 29 AGM framing — it was NOT the merger vote ──
async function patchAES() {
  const deal = await getDeal("AES Corporation");
  if (!deal) return console.warn("AES not found");
  const patches = {};

  // Fix shareholder_votes label/outcome_summary
  const votes = deal.shareholder_votes || [];
  let votesChanged = false;
  const nextVotes = votes.map((v) => {
    const summary = v.outcome_summary || "";
    if (summary.includes("April 29 AGM was the routine annual meeting")) return v;
    votesChanged = true;
    return {
      ...v,
      label: "Target shareholders — special meeting not yet scheduled",
      outcome_summary:
        "The April 29, 2026 AGM was the routine annual meeting (director elections, say-on-pay, auditor) — NOT the merger vote. The merger vote requires a separate special meeting that has not yet been scheduled or noticed as of April 30, 2026.",
    };
  });
  if (votesChanged) patches.shareholder_votes = nextVotes;

  // Fix deck if it mentions AGM as merger vote
  if ((deal.deck || "").includes("AES AGM set for April 29") ||
      (deal.deck || "").includes("AGM April 29")) {
    patches.deck =
      "Multi-jurisdictional regulatory review underway. Merger special meeting not yet scheduled. PUCO data center backlash, Indiana politics, and CFIUS (QIA involvement) are the key state-level risks.";
  }

  // Advance next_key_event from AGM Apr 29
  if (deal.next_key_event_date === "2026-04-29") {
    patches.next_key_event_date = "2026-06-30";
    patches.next_key_event_label = "Merger special meeting (date TBD)";
  }

  if (await setOnDeal(deal._id, patches)) console.log("✓ AES updated");
  else console.log("· AES: nothing to change");
}

// ── EA/PIF: tighten ctfn_estimated_close to Jun 30, 2026 per company guidance ──
async function patchEA() {
  const deal = await getDeal("Electronic Arts");
  if (!deal) return console.warn("EA not found");
  if (deal.ctfn_estimated_close === "2026-06-30") return console.log("· EA: already tightened");
  await client
    .patch(deal._id)
    .set({ ctfn_estimated_close: "2026-06-30" })
    .commit();
  console.log("✓ EA: ctfn_estimated_close → 2026-06-30 (Q1 FY27 per consortium guidance)");
}

// ── KVUE/KMB: add EU FSR filing track ────────────────────────────────────
async function patchKVUE() {
  const deal = await getDeal("Kenvue");
  if (!deal) return console.warn("KVUE not found");
  const filings = deal.filings || [];
  if (filings.some((f) => f.jurisdiction === "EC_FSR")) {
    return console.log("· KVUE: EC_FSR already present");
  }
  const next = [
    ...filings,
    {
      _key: k(),
      _type: "filing",
      jurisdiction: "EC_FSR",
      outcome: "pending",
      outcome_summary:
        "Kimberly-Clark filed for EC approval under the Foreign Subsidies Regulation. Provisional EC decision deadline: June 8, 2026.",
      steps: [
        {
          _key: k(),
          _type: "filing_step",
          label: "FSR notification filed",
        },
        {
          _key: k(),
          _type: "filing_step",
          label: "EC FSR provisional decision deadline",
          expected_date: "2026-06-08",
        },
      ],
    },
  ];
  await client.patch(deal._id).set({ filings: next }).commit();
  console.log("✓ KVUE: added EU FSR filing track");
}

// ── SWKS/QRVO: KFTC additional info request + SAMR bundling concerns ────
async function patchQRVO() {
  const deal = await getDeal("Qorvo");
  if (!deal) return console.warn("QRVO not found");
  const filings = deal.filings || [];
  let changed = false;
  const next = filings.map((f) => {
    if (f.jurisdiction === "KFTC") {
      const steps = (f.steps || []).map((s) => ({ ...s, _key: k() }));
      if (steps.some((s) => s.label === "KFTC additional information request")) return f;
      changed = true;
      steps.push({
        _key: k(),
        _type: "filing_step",
        label: "KFTC additional information request",
        note: "Date not pinned in public reporting — issued in spring 2026",
      });
      return {
        ...f,
        outcome_summary:
          "KFTC issued a request for additional information per industry trade press. Review ongoing.",
        steps,
      };
    }
    if (f.jurisdiction === "SAMR") {
      const summary = f.outcome_summary || "";
      if (summary.includes("bundling concerns")) return f;
      changed = true;
      return {
        ...f,
        outcome_summary:
          "SAMR review ongoing. Capitol Forum reporting (March 25, 2026) indicated SAMR has expressed initial concerns around bundling practices and disadvantage to Chinese competitors. Industry sources still characterize an outright veto as unlikely but expect a lengthy review.",
      };
    }
    return f;
  });
  if (!changed) return console.log("· QRVO: KFTC/SAMR already updated");
  await client.patch(deal._id).set({ filings: next }).commit();
  console.log("✓ QRVO: KFTC RFI + SAMR bundling concerns added");
}

async function run() {
  console.log(`Refresh patch — ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/production\n`);
  await patchPSKY();
  await patchCWAN();
  await patchSKYT();
  await patchUNP();
  await patchWTRG();
  await patchTXNM();
  await patchAES();
  await patchEA();
  await patchKVUE();
  await patchQRVO();
  console.log("\nDone.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
