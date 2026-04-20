// Targeted patch: fix factual inconsistencies in live deal data.
//
// Covers four deals, each patched by specific field. Idempotent — safe to
// re-run. Does not wipe anything.
//
// Run: node scripts/patch-content-audit-fixes.mjs

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

function p(text) {
  return {
    _type: "block",
    _key: k(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: k(), text, marks: [] }],
  };
}

// ── PSKY/WBD — fix "8 days" → "2 days" (today is Apr 21, vote is Apr 23) ──
async function patchPSKY() {
  const id = "deal-paramount-skydance-warner-bros-discovery";
  const deal = await client.getDocument(id);
  if (!deal) return console.warn(`Skip ${id} — not found`);
  const newDeck = (deal.deck || "").replace(
    /Shareholder vote in \d+ days?\./,
    "Shareholder vote in 2 days.",
  );
  if (newDeck === deal.deck) return console.log(`PSKY/WBD deck: already patched`);
  await client.patch(id).set({ deck: newDeck }).commit();
  console.log(`✓ PSKY/WBD deck updated`);
}

// ── SLAB/TXN — HSR cleared, update prose + filings[].HSR + next event ──
async function patchSLAB() {
  const id = "deal-texas-instruments-silicon-labs";
  const deal = await client.getDocument(id);
  if (!deal) return console.warn(`Skip ${id} — not found`);

  const patches = {};

  const newDeck =
    "HSR cleared April 20 (waiting period expired, no second request). SAMR approval required — China known for slow-walking US semiconductor deals. Shareholder vote scheduled April 30.";
  if (deal.deck !== newDeck) patches.deck = newDeck;

  const newAlert =
    "HSR cleared April 20. Shareholder vote scheduled April 30.";
  if (deal.alert_summary !== newAlert) patches.alert_summary = newAlert;

  // free_preview — replace the second block entirely.
  const newPreview = [
    p(
      "Texas Instruments is acquiring Silicon Labs for $231 per share in cash, implying an equity value of $7.6bn. The 69% premium to the target's unaffected close on February 3 reflects Silicon Labs' position as a pure-play IoT wireless connectivity platform.",
    ),
    p(
      "HSR was filed on March 20 and the waiting period expired April 20 without a second request, clearing the US antitrust review. The transaction is also subject to approval by China's SAMR, which is known for slow-walking US semiconductor mergers. A Silicon Labs shareholder vote is scheduled for April 30, 2026.",
    ),
  ];
  // Only replace if the current preview still contains the old "scheduled to expire" wording.
  const previewText = JSON.stringify(deal.free_preview || []);
  if (
    previewText.includes("scheduled to expire on April 20") ||
    previewText.includes("Shareholder vote approved April 30") ||
    previewText.includes("vote is scheduled for April 30, 2026")
  ) {
    patches.free_preview = newPreview;
  }

  // next_key_event — move from HSR expiration (past) to the shareholder vote.
  if (deal.next_key_event_date === "2026-04-20") {
    patches.next_key_event_date = "2026-04-30";
    patches.next_key_event_label = "Shareholder vote";
  }

  // filings — rewrite the HSR filing only.
  const filings = Array.isArray(deal.filings) ? deal.filings : [];
  let filingsChanged = false;
  const nextFilings = filings.map((f) => {
    if (f.jurisdiction !== "HSR") return f;
    // Already cleared? Leave alone.
    if (f.outcome === "cleared") return f;
    filingsChanged = true;
    return {
      ...f,
      outcome: "cleared",
      outcome_summary:
        "HSR filed March 20. Waiting period expired April 20 with no second request.",
      steps: [
        { _key: k(), _type: "filing_step", label: "HSR filed", actual_date: "2026-03-20" },
        {
          _key: k(),
          _type: "filing_step",
          label: "HSR waiting period expires",
          actual_date: "2026-04-20",
        },
      ],
    };
  });
  if (filingsChanged) patches.filings = nextFilings;

  if (Object.keys(patches).length === 0) {
    return console.log(`SLAB/TXN: already patched`);
  }
  await client.patch(id).set(patches).commit();
  console.log(`✓ SLAB/TXN updated (${Object.keys(patches).join(", ")})`);
}

// ── CWAN — strip "45-day" from go-shop descriptions ──
async function patchCWAN() {
  const id =
    "deal-permira---warburg-pincus-consortium-clearwater-analytics";
  let deal = await client.getDocument(id);
  // Slug format in seed: `permira---warburg-pincus-consortium-clearwater-analytics`
  // but slugify strips non-alphanum to `-`. Try alternates.
  if (!deal) {
    const alt = await client.fetch(
      `*[_type == "deal" && target == "Clearwater Analytics"][0]{_id}`,
    );
    if (alt?._id) deal = await client.getDocument(alt._id);
  }
  if (!deal) return console.warn(`Skip CWAN — not found`);

  const patches = {};

  // free_preview — rewrite second block if it still contains "45-day go-shop".
  const previewHas45 = JSON.stringify(deal.free_preview || []).includes(
    "45-day go-shop",
  );
  if (previewHas45) {
    patches.free_preview = [
      ...(deal.free_preview?.slice(0, 1) || []),
      p(
        "HSR early termination was granted February 13. The EC notified the deal as a super-simplified review on March 26 with Phase I expiring May 6. The shareholder vote is also set for May 6. A go-shop period ran from December 22 to January 23 and reached 44 potential bidders — six executed NDAs but none submitted a competing bid.",
      ),
    ];
  }

  // background — rewrite the single block mentioning "45-day go-shop"
  const bg = deal.background || [];
  let bgChanged = false;
  const nextBg = bg.map((block) => {
    const text = JSON.stringify(block);
    if (!text.includes("45-day go-shop")) return block;
    bgChanged = true;
    return p(
      "On December 22, the company began a go-shop period running to January 23, 2026, contacting 44 potential bidders. Between December 27, 2025, and January 23, 2026, six parties executed NDAs, but each declined to submit a superior proposal, citing valuation concerns, financing constraints or strategic considerations. The go-shop expired on January 23, 2026, without any alternative takeover proposal.",
    );
  });
  if (bgChanged) patches.background = nextBg;

  if (Object.keys(patches).length === 0) {
    return console.log(`CWAN: already patched`);
  }
  await client.patch(deal._id).set(patches).commit();
  console.log(`✓ CWAN updated (${Object.keys(patches).join(", ")})`);
}

// ── WTRG/AWK — past filing deadlines → actual "filed" steps ──
async function patchWTRG() {
  const deal = await client.fetch(
    `*[_type == "deal" && target == "Essential Utilities"][0]{_id, filings}`,
  );
  if (!deal) return console.warn(`Skip WTRG/AWK — not found`);
  const filings = Array.isArray(deal.filings) ? deal.filings : [];
  let changed = false;
  const next = filings.map((f) => {
    if (f.jurisdiction === "HSR") {
      const steps = f.steps || [];
      if (steps.some((s) => s.label === "HSR filing deadline")) {
        changed = true;
        return {
          ...f,
          outcome_summary:
            "Parties were required to file within 60 days post-DMA (by December 26, 2025). Clearance expected Q1 2026; currently past the initial expected clearance date with no second-request reporting.",
          steps: steps.map((s) =>
            s.label === "HSR filing deadline"
              ? {
                  ...s,
                  label: "HSR filed",
                  actual_date: s.expected_date,
                  expected_date: undefined,
                  note: "On or before the 60-day post-DMA deadline",
                }
              : s,
          ),
        };
      }
    }
    if (f.jurisdiction === "FCC") {
      const steps = f.steps || [];
      if (steps.some((s) => s.label === "FCC filing deadline")) {
        changed = true;
        return {
          ...f,
          outcome_summary:
            "FCC filing required within 60 days post-DMA. Clearance timeline typically 6 months.",
          steps: steps.map((s) =>
            s.label === "FCC filing deadline"
              ? {
                  ...s,
                  label: "FCC filing submitted",
                  actual_date: s.expected_date,
                  expected_date: undefined,
                  note: "On or before the 60-day post-DMA deadline",
                }
              : s,
          ),
        };
      }
    }
    return f;
  });
  if (!changed) return console.log(`WTRG/AWK: already patched`);
  await client.patch(deal._id).set({ filings: next }).commit();
  console.log(`✓ WTRG/AWK updated (filings)`);
}

async function run() {
  console.log(`Patching live Sanity (${projectId}/${dataset})…`);
  await patchPSKY();
  await patchSLAB();
  await patchCWAN();
  await patchWTRG();
  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
