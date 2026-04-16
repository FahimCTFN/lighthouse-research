// Seed CTFN-style M&A deals into Sanity. Idempotent — uses stable _ids.
// Run: node scripts/seed.mjs

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

// Portable Text helpers
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
function list(items) {
  return items.map((text) => ({
    _type: "block",
    _key: k(),
    style: "normal",
    listItem: "bullet",
    level: 1,
    markDefs: [],
    children: [{ _type: "span", _key: k(), text, marks: [] }],
  }));
}
function slugify(acq, tgt) {
  return `${acq}-${tgt}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Deals (as of April 2026, drawn from the Lighthouse by CTFN report) ─────
const deals = [
  // 1 ── WBD / PSKY — the mockup deal
  {
    acquirer: "Paramount Skydance",
    target: "Warner Bros. Discovery",
    acquirer_ticker: "PSKY",
    target_ticker: "WBD",
    status: "vote_scheduled",
    sector: "media_telecom",
    target_jurisdiction: "Delaware",
    deck: "Shareholder vote in 8 days. California AG investigation is the live risk. ISS and Glass Lewis back approval but reject Zaslav's $886mn parachute.",
    key_risk_summary:
      "Primary deal risk is in California. AG Rob Bonta has directed the state DOJ to open an investigation and may seek to block the merger through litigation rather than negotiated remedies — a harder path to resolve than a typical antitrust consent decree.",
    equity_value: 77000,
    shares_outstanding: 2481,
    offer_price: 31,
    offer_terms: "$31.00 cash",
    premium: 147,
    premium_reference: "vs Sep 10, 2025 unaffected close",
    termination_fee: 3000,
    termination_fee_pct: 3.9,
    reverse_termination_fee: 7000,
    reverse_termination_fee_pct: 9,
    termination_fee_notes:
      "Ticking fee of $0.25/share per quarter if closing occurs after September 30, 2026.",
    financing:
      "Ellison Trust and RedBird Capital Partners committed ~$47bn in PIPE investments. Combined with committed debt financing, the deal is fully funded and not subject to a financing condition.",
    ctfn_closing_probability: 71,
    ctfn_estimated_close: "2026-07-15",
    ctfn_probability_notes:
      "Headline risk concentrated in California. EC remedies (children's TV divestiture) assumed.",
    announcement_date: "2026-02-27",
    published_date: "2026-03-02",
    next_key_event_date: "2026-04-23",
    next_key_event_label: "Shareholder vote",
    outside_date: "2027-03-04",
    outside_date_final: "2027-06-04",
    outside_date_notes:
      "Automatic 3-month extension if required approvals are still pending on March 4, 2027.",
    closing_guidance: "Q3 2026",
    best_efforts:
      "Parties shall divest assets if required and will defend the transaction through litigation.",
    target_advisors:
      "Allen & Company, JP Morgan and Evercore (financial). Wachtell Lipton, Rosen & Katz and Debevoise & Plimpton (legal).",
    acquirer_advisors:
      "Centerview Partners and RedBird Advisors (lead financial); BofA Securities, Citi, M. Klein & Company and LionTree also financial. Cravath, Swaine & Moore and Latham & Watkins (legal).",
    free_preview: [
      p("Paramount Skydance paid Warner Bros. Discovery's $2.8bn termination fee to break its prior Netflix merger agreement. The deal was announced on February 27, 2026 at $31 per share in cash, representing a 147% premium to WBD's unaffected close on September 10, 2025."),
      p("Primary remaining risk is California. AG Rob Bonta has directed the state DOJ to open an investigation and may seek to block the merger through litigation. HSR expired February 19 following substantial compliance. EC review remains outstanding, with CTFN reporting children's-television divestitures likely as a remedy."),
    ],
    background: [
      p("In Q1 2024, WBD senior management reviewed Paramount Global as a potential counterparty but did not submit a proposal. On September 14, 2025, David Ellison proposed a takeover at ~$19 per share; the target board rejected it as inadequate. On September 30, Paramount raised to ~$22; rejected again."),
      p("On October 13, 2025, Paramount submitted ~$23.50. On October 16, Netflix and Company A expressed interest. On October 20, the target board authorized a broader strategic review. Between October 21 and November 10, WBD contacted ~13 potential counterparties."),
      p("November 20 first-round bids: Paramount $25.50, Netflix $27 for Streaming & Studios, Company A $33.25 headline. December 1 — Paramount raised to $26.50 all-cash, Netflix to $27.75. December 4 — Paramount $30 all-cash; Netflix issued best-and-final; WBD signed the Netflix merger agreement."),
      p("December 8 — Paramount launched an unsolicited $30 tender. A bidding war ran through February 2026. On February 21, Paramount proposed $31 plus ticking consideration with $7bn RTF. On February 26, Paramount's binding proposal at $31; Netflix declined to match. Announced February 27."),
    ],
    commentary: [
      p("Paramount Skydance paid WBD's $2.8bn Netflix break fee. The Ellison Parties signed a comprehensive guarantee covering billions in merger consideration, termination fees, and potential damages."),
      p("Over 1,000 prominent Hollywood creatives signed a letter against the deal warning of job losses and less choice for audiences. Political opposition has been vocal, though formal antitrust theories remain concentrated in California."),
    ],
    filings: [
      {
        _key: k(),
        jurisdiction: "HSR",
        outcome: "cleared",
        outcome_summary: "Waiting period expired Feb 19, 2026 without challenge.",
        steps: [
          { _key: k(), label: "HSR filed", actual_date: "2025-12-08" },
          { _key: k(), label: "Second request issued", actual_date: "2025-12-23" },
          { _key: k(), label: "Substantial compliance certified", actual_date: "2026-02-09" },
          { _key: k(), label: "Waiting period expired", actual_date: "2026-02-19" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "EC_Merger",
        outcome: "pending",
        outcome_summary: "Pre-notification ongoing. Children's-TV divestitures likely as remedy to resolve horizontal overlaps.",
        steps: [
          { _key: k(), label: "Pre-notification discussions", actual_date: "2026-03-10" },
          { _key: k(), label: "Notification filed", expected_date: "2026-05-15" },
          { _key: k(), label: "Phase I decision", expected_date: "2026-06-19" },
          { _key: k(), label: "Remedy discussions", note: "Expected if Phase II opened" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "CMA",
        outcome: "pending",
        steps: [
          { _key: k(), label: "Invitation to comment opened", actual_date: "2026-04-06" },
          { _key: k(), label: "Comment period closes", expected_date: "2026-04-27" },
          { _key: k(), label: "Phase 1 decision", expected_date: "2026-06-22" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "State_AG",
        display_name: "California Attorney General",
        outcome: "conditional",
        outcome_summary: "AG Rob Bonta has directed the California DOJ to open an investigation. AG may pursue litigation rather than a negotiated consent decree — the primary deal risk.",
        steps: [
          { _key: k(), label: "Investigation opened", actual_date: "2026-03-15" },
          { _key: k(), label: "Initial discovery response", expected_date: "2026-05-30" },
          { _key: k(), label: "AG decision / filing", note: "Timing uncertain" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "BKartA",
        display_name: "Germany & Slovenia",
        outcome: "cleared",
        steps: [
          { _key: k(), label: "Local merger control clearances", actual_date: "2026-03-01" },
        ],
      },
    ],
    shareholder_vote: {
      outcome: "pending",
      label: "WBD shareholders — majority of outstanding shares",
      outcome_summary:
        "ISS & Glass Lewis recommend FOR the merger but AGAINST David Zaslav's $886mn golden parachute.",
      committed_pct: 38,
      committed_notes: "Advance/Newhouse and management block",
      steps: [
        { _key: k(), label: "Proxy mailed", actual_date: "2026-03-20" },
        { _key: k(), label: "ISS / Glass Lewis recommendations", actual_date: "2026-04-14" },
        { _key: k(), label: "Vote meeting", expected_date: "2026-04-23" },
      ],
    },
    ctfn_analysis: [
      p("Our 71% probability reflects the California tail risk as binary. Base case: EC remedies via children's-TV divestitures, California AG settles with conditions or backs down short of litigation. Bear case: California files in state court to block, forcing closing into mid-2027 or recut terms."),
      p("The ticking fee structure protects WBD shareholders from regulatory delay value erosion, but doesn't compensate holders for timeline uncertainty — the $0.25/qtr accrual works out to roughly 1% per quarter."),
    ],
    risk_factors: [
      p("California AG pursuing litigation rather than consent decree (primary binary)."),
      p("EC remedy scope broader than children's TV — could reach sports rights."),
      p("CMA Phase II escalation."),
      p("Shareholder vote margin tighter than expected given parachute concerns."),
    ],
    shareholder_activism: [
      {
        _key: k(),
        date: "2026-04-14",
        actor: "Institutional Shareholder Services (ISS)",
        stance: "critical",
        description:
          "ISS recommended WBD shareholders vote FOR the merger but AGAINST David Zaslav's $886mn golden parachute. The proxy advisor endorsed the strategic logic of the combination but flagged the severance package as excessive relative to peer benchmarks and inconsistent with pay-for-performance standards.",
        source_url: "https://www.sec.gov/",
      },
      {
        _key: k(),
        date: "2026-04-14",
        actor: "Glass Lewis",
        stance: "critical",
        description:
          "Glass Lewis issued a parallel recommendation — FOR the merger, AGAINST the parachute. Both proxy advisors converging on the same split recommendation adds institutional weight to the severance-pay concern heading into the April 23 vote.",
      },
      {
        _key: k(),
        date: "2026-03-28",
        actor: "Hollywood creative community",
        stance: "opposed",
        description:
          "Over 1,000 prominent Hollywood creatives — directors, writers, and showrunners — signed an open letter against the deal, warning of job losses and reduced creative choice. While not a formal vote bloc, the letter has generated sustained press coverage that may shape the political backdrop to regulatory review.",
      },
      {
        _key: k(),
        date: "2026-03-12",
        actor: "International Brotherhood of Teamsters",
        stance: "opposed",
        description:
          "The Teamsters sent a letter to the DOJ urging it to block the merger, citing concerns about job losses across production, distribution, and newsroom operations. The union represents workers at several WBD subsidiaries and has been active in opposing media consolidation.",
        source_url: "https://www.sec.gov/",
      },
      {
        _key: k(),
        date: "2026-03-15",
        actor: "California Attorney General Rob Bonta",
        stance: "opposed",
        description:
          "AG Bonta directed the California Department of Justice to open a formal investigation into the transaction. Public statements indicate the state may pursue litigation to block the merger rather than negotiate a consent decree — a materially harder path to resolve than typical antitrust remedies.",
      },
    ],
    documents: [
      { _key: k(), title: "Press Release (2/27/26)", url: "https://www.sec.gov/" },
      { _key: k(), title: "Definitive Merger Agreement", url: "https://www.sec.gov/" },
      { _key: k(), title: "Definitive Proxy Statement", url: "https://www.sec.gov/" },
      { _key: k(), title: "Teamsters Request to DOJ (3/12/26)", url: "https://www.sec.gov/" },
      { _key: k(), title: "CADE Notification (3/31/26)", url: "https://www.sec.gov/" },
    ],
    trigger_alert: false,
    alert_summary: "ISS and Glass Lewis recommend approval ahead of the April 23 shareholder vote.",
  },

  // 2 ── NSC / UNP — largest rail deal in US history
  {
    acquirer: "Union Pacific",
    target: "Norfolk Southern",
    acquirer_ticker: "UNP",
    target_ticker: "NSC",
    status: "regulatory_review",
    sector: "industrials",
    target_jurisdiction: "Virginia",
    deck: "First transcontinental Class I rail merger tested under the STB's 2001 enhanced-competition standard. BNSF and industry groups are organizing opposition.",
    key_risk_summary:
      "Significant pushback from industry groups will shape the STB's review. The American Chemistry Council, Chlorine Institute, America's Power, Agricultural Retailers Association, automotive OEMs and competitor BNSF have been outspoken against the deal.",
    equity_value: 71900,
    shares_outstanding: 224,
    offer_price: 320,
    offer_terms: "1.0 UP share + $88.82 cash per NSC share (~$320 headline)",
    premium: 25,
    premium_reference: "vs NSC 30-day VWAP as of July 16, 2025",
    termination_fee: 2500,
    termination_fee_pct: 3.5,
    reverse_termination_fee: 2500,
    reverse_termination_fee_pct: 3.5,
    financing:
      "Cash portion funded through a combination of new debt and balance-sheet cash. Union Pacific will issue ~225mn shares to NSC holders, representing ~27% of the combined company on a fully diluted basis.",
    ctfn_closing_probability: 58,
    ctfn_estimated_close: "2027-06-30",
    ctfn_probability_notes:
      "STB's 2001 rules require enhancement of competition, not just preservation. First test of that standard on a Class I merger.",
    announcement_date: "2025-07-29",
    published_date: "2025-07-30",
    next_key_event_date: "2026-04-30",
    next_key_event_label: "STB application refiling",
    outside_date: "2028-01-28",
    closing_guidance: "H1 2027",
    best_efforts:
      "Parties are not obligated to divest any assets but will defend the transaction through litigation if necessary.",
    target_advisors:
      "BofA (exclusive financial). Wachtell, Lipton, Rosen & Katz (legal); Sidley Austin (regulatory).",
    acquirer_advisors:
      "Morgan Stanley and Wells Fargo (financial). Skadden Arps (legal); Covington & Burling (regulatory).",
    free_preview: [
      p("Union Pacific's ~$72bn acquisition of Norfolk Southern would create the first coast-to-coast Class I railroad. It is the first major rail merger evaluated under the STB's 2001 rules, which require Class I mergers to enhance competition — not merely preserve it."),
      p("On January 16, 2026 the STB unanimously rejected the parties' initial application as incomplete, citing a missing full-system competitive impact analysis and the omitted Schedule 5.8 addressing 'Materially Burdensome Regulatory Condition' language. Refiling is scheduled for April 30, 2026; the deadline is June 22."),
    ],
    background: [
      p("On Dec 12–13, 2024, UP CEO Jim Vena raised the transcontinental merger concept at a UP board dinner. On Dec 18, NSC CEO Mark George discussed it with Vena. On Jan 28, 2025, NSC's board agreed to evaluate. Late Jan–Feb 2025, Vena and UP Chair Michael McCarthy discussed acquiring NSC or another railroad; UP engaged Morgan Stanley and Wells Fargo."),
      p("On Mar 18, George and Vena discussed timing at an AAR meeting in Washington, D.C. On May 15, senior teams met; UP expressed strong interest and identified NSC as its optimal counterparty."),
      p("On Jun 20, UP authorized a preliminary non-binding all-stock IOI: 1.261 UP shares per NSC share (~$280, ~11% premium). NSC told UP it was inadequate. On July 16, UP's board authorized a revised IOI: $310 (~70% stock / 30% cash) and a 3% RT fee."),
      p("On July 20, UP delivered 0.9387 UP shares + $93 cash per NSC share (~$310 value). On July 21, NSC counterproposed 1.0000 UP share + $100 cash per NSC share (~$331). On July 22, UP delivered its Final Proposal: 1.0000 UP share + cash valuing NSC at $320 per share (~25% premium), $2.5bn RT fee, three NSC directors on the combined board. On July 28, both boards unanimously approved; announced July 29."),
    ],
    commentary: [
      p("Union Pacific will issue about 225mn shares to NSC shareholders, representing 27% ownership in the combined company on a fully diluted basis."),
      p("As of early October 2025, BNSF has an active 'Preserve Rail Competition' campaign directing users to file letters with the STB opposing the deal. Industry opposition is broader and more organized than any recent Class I merger."),
    ],
    filings: [
      {
        _key: k(),
        jurisdiction: "STB",
        outcome: "conditional",
        outcome_summary: "First Class I merger tested under the STB's 2001 enhance-competition standard. Application rejected as incomplete in January; refiling April 30 with a June 22 deadline. Ordinary-course document production due April 7.",
        steps: [
          { _key: k(), label: "Notice of intent", actual_date: "2025-07-30" },
          { _key: k(), label: "Full application filed", actual_date: "2025-12-19", note: "Docket FD 36873" },
          { _key: k(), label: "Application rejected as incomplete", actual_date: "2026-01-16", note: "Missing system-wide competitive analysis + Schedule 5.8" },
          { _key: k(), label: "DOJ brief filed", actual_date: "2026-03-03", note: "Urged STB to order ordinary-course documents" },
          { _key: k(), label: "Document production order issued", actual_date: "2026-03-18" },
          { _key: k(), label: "Ordinary-course documents due", expected_date: "2026-04-07" },
          { _key: k(), label: "Application refiling", expected_date: "2026-04-30", note: "Refiling deadline June 22" },
          { _key: k(), label: "STB acceptance of refiling", expected_date: "2026-06-15" },
          { _key: k(), label: "Public comment period (45d)", expected_date: "2026-07-30" },
          { _key: k(), label: "Responsive applications (90d)", expected_date: "2026-10-28" },
          { _key: k(), label: "Final STB decision", expected_date: "2027-06-30" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "FCC",
        outcome: "pending",
        outcome_summary: "Required for transfer of wireless and satellite licenses.",
        steps: [
          { _key: k(), label: "License transfer application", expected_date: "2026-08-01" },
          { _key: k(), label: "FCC approval", expected_date: "2027-03-31" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "CNA",
        outcome: "pending",
        outcome_summary: "Comisión Federal de Competencia Económica — cross-border operations require Mexican clearance.",
        steps: [
          { _key: k(), label: "Notification", expected_date: "2026-06-15" },
          { _key: k(), label: "Decision", expected_date: "2027-01-15" },
        ],
      },
    ],
    shareholder_vote: {
      outcome: "approved",
      label: "Target shareholders — approved November 14, 2025",
      steps: [
        { _key: k(), label: "Proxy mailed", actual_date: "2025-10-01" },
        { _key: k(), label: "Vote meeting", actual_date: "2025-11-14", note: "Approved" },
      ],
    },
    ctfn_analysis: [
      p("Our 58% probability reflects the novelty of the STB standard. There is no direct precedent for how the 2001 rules are applied to a transcontinental Class I combination. Industry opposition is unusually well-organized, including an incumbent competitor (BNSF) actively coordinating shipper letters."),
      p("The January 2026 application rejection was substantive — the absence of a system-wide competitive impact analysis suggests the parties' initial approach may not survive the enhanced standard without meaningful remedies, including possibly divestiture of certain interline agreements."),
    ],
    risk_factors: [
      p("STB's 'enhance competition' standard has no modern precedent; interpretation could demand trackage-rights remedies or haulage arrangements."),
      p("BNSF's organized opposition may drive shipper participation in the record."),
      p("FCC and Mexican antitrust approvals add secondary tail risk."),
    ],
    shareholder_activism: [
      {
        _key: k(),
        date: "2025-10-06",
        actor: "BNSF Railway",
        stance: "opposed",
        description:
          "BNSF launched a public 'Preserve Rail Competition' campaign with a dedicated website directing users to file letters with the STB opposing the merger. Competitor opposition at this scale is unusually organized and may drive shipper participation in the regulatory record — a novel dynamic for a Class I rail review.",
      },
      {
        _key: k(),
        date: "2025-11-10",
        actor: "American Chemistry Council",
        stance: "opposed",
        description:
          "The ACC, Chlorine Institute, America's Power, and the Agricultural Retailers Association issued coordinated statements opposing the merger, citing captive-shipper risk. Chemical and agricultural shippers are particularly reliant on single-line routings that a combined UP/NSC would control on the Eastern corridor.",
      },
      {
        _key: k(),
        date: "2025-12-04",
        actor: "Automotive OEMs coalition",
        stance: "opposed",
        description:
          "A coalition of automotive manufacturers flagged concerns about the combined network's handling of finished-vehicle logistics. The OEMs have not publicly opposed the merger outright but signaled they will be active participants in the STB comment period.",
      },
      {
        _key: k(),
        date: "2026-03-03",
        actor: "US Department of Justice (Antitrust Division)",
        stance: "critical",
        description:
          "DOJ filed a brief urging the STB to order HSR-style ordinary-course business documents from the applicants. This is an unusual level of DOJ engagement in a proceeding formally governed by the STB, and signals the Division's intent to shape the evidentiary record even though it is not the primary reviewer.",
      },
    ],
    documents: [
      { _key: k(), title: "Press Release", url: "https://www.sec.gov/" },
      { _key: k(), title: "Investor Presentation", url: "https://www.sec.gov/" },
      { _key: k(), title: "Definitive Merger Agreement", url: "https://www.sec.gov/" },
      { _key: k(), title: "STB Transaction Notice", url: "https://www.stb.gov/" },
      { _key: k(), title: "Definitive Proxy", url: "https://www.sec.gov/" },
      { _key: k(), title: "STB Rejection of Application (1/16/26)", url: "https://www.stb.gov/" },
      { _key: k(), title: "DOJ Request for Ordinary Course Docs (3/3/26)", url: "https://www.justice.gov/" },
      { _key: k(), title: "STB March 18 Production Order", url: "https://www.stb.gov/" },
    ],
    trigger_alert: false,
    alert_summary: "STB orders parties to produce HSR-style documents by April 7.",
  },

  // 3 ── EA / PIF, Silver Lake, Affinity
  {
    acquirer: "PIF / Silver Lake / Affinity Partners",
    target: "Electronic Arts",
    target_ticker: "EA",
    status: "regulatory_review",
    sector: "technology",
    target_jurisdiction: "Delaware",
    deck: "Largest take-private in gaming history. CFIUS review and EC FSR Phase II risk are the remaining timing variables.",
    key_risk_summary:
      "FSR Phase II in the EC would extend timing materially. CFIUS mitigation timing is the other live variable given PIF's role as lead investor.",
    equity_value: 52400,
    shares_outstanding: 249,
    offer_price: 210,
    offer_terms: "$210 cash per share",
    premium: 25,
    premium_reference: "vs EA unaffected close $168.32 (Sep 25, 2025)",
    termination_fee: 1000,
    termination_fee_pct: 1.9,
    reverse_termination_fee: 1000,
    reverse_termination_fee_pct: 1.9,
    termination_fee_notes:
      "Target fee reduced to $540mn (1%) for a superior proposal within 45 days post-DMA with termination within 75 days.",
    financing:
      "~$36bn equity (mostly PIF, with Silver Lake and Affinity minority) and $20bn committed debt from JPMorgan. Oak-Eagle AcquireCo placed $2.875bn 7.250% senior secured notes due 2033, €1.08bn 6.250% senior secured euro notes due 2033, and $2.5bn 8.750% senior notes due 2034 into escrow pending close.",
    ctfn_closing_probability: 74,
    ctfn_estimated_close: "2026-09-30",
    ctfn_probability_notes:
      "HSR and most non-EU/US reviews cleared. Remaining: CFIUS, EC merger control, EC FSR, Canada.",
    announcement_date: "2025-09-29",
    published_date: "2025-09-30",
    next_key_event_date: "2026-05-10",
    next_key_event_label: "EC merger control filing",
    outside_date: "2026-09-28",
    outside_date_final: "2026-12-28",
    outside_date_notes:
      "Automatic 3-month extension if CFIUS or EC approvals remain pending.",
    closing_guidance: "Q1 FY2027 (Apr 1 – Jun 30, 2026)",
    best_efforts:
      "Parties shall defend the transaction in court if necessary. Not required to agree to any remedy in connection with HSR, CFIUS or other requirements (6.5a).",
    target_advisors: "Goldman Sachs (financial). Wachtell, Lipton, Rosen & Katz (legal).",
    acquirer_advisors:
      "JP Morgan (financial to consortium). Kirkland & Ellis (consortium legal); Kirkland & Ellis + Gibson Dunn (PIF); Latham & Watkins + Simpson Thacher (Silver Lake); Sidley Austin (Affinity).",
    free_preview: [
      p("The $52.4bn take-private of Electronic Arts by PIF, Silver Lake and Affinity Partners is the largest leveraged buyout in gaming. Terms: $210 cash per share, a 25% premium to the unaffected close."),
      p("HSR expired February 9, 2026. Shareholders approved on December 22. The remaining variables are CFIUS mitigation timing and European Commission reviews, including the FSR filing."),
    ],
    background: [
      p("Since 2020, EA's board periodically evaluated strategic options — partnerships, combinations and sale. During this period, PIF disclosed 5% ownership in February 2022 and 9.2% in February 2024."),
      p("On March 2, 2025, Silver Lake sent CEO Andrew Wilson a presentation, suggesting PIF as co-investor. By May, EA management and a PIF/Silver Lake/Affinity consortium held informal talks. In early July, all three signed NDAs."),
      p("On September 12, 2025, the consortium proposed $200 per share. Board directed management to seek $210–$212. The consortium agreed to $210 on September 26. On September 28, the board unanimously approved; Goldman delivered its fairness opinion; announced September 29."),
    ],
    commentary: [
      p("The transaction included a 45-day window-shop period which ended on November 12, 2025 with no superior proposal surfacing."),
    ],
    filings: [
      {
        _key: k(),
        jurisdiction: "HSR",
        outcome: "cleared",
        steps: [
          { _key: k(), label: "HSR filed", actual_date: "2025-11-15" },
          { _key: k(), label: "Waiting period expired", actual_date: "2026-02-09" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "CFIUS",
        outcome: "conditional",
        outcome_summary: "Mitigation discussions ongoing given PIF as lead investor. Timing is the primary variable.",
        steps: [
          { _key: k(), label: "Notice filed", actual_date: "2025-11-20" },
          { _key: k(), label: "45-day review opened", actual_date: "2025-12-05" },
          { _key: k(), label: "Investigation phase (45d)", actual_date: "2026-01-19" },
          { _key: k(), label: "Mitigation agreement", expected_date: "2026-05-30" },
          { _key: k(), label: "Final determination", expected_date: "2026-07-30" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "EC_Merger",
        outcome: "pending",
        steps: [
          { _key: k(), label: "Pre-notification discussions", actual_date: "2026-03-15" },
          { _key: k(), label: "Notification filed", expected_date: "2026-05-10" },
          { _key: k(), label: "Phase I decision", expected_date: "2026-06-14" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "EC_FSR",
        outcome: "pending",
        outcome_summary: "Foreign Subsidies Regulation review of PIF's capital commitment. Phase II would materially extend timing.",
        steps: [
          { _key: k(), label: "Pre-notification discussions", actual_date: "2026-03-15" },
          { _key: k(), label: "Notification filed", expected_date: "2026-05-10" },
          { _key: k(), label: "Phase I decision (25 working days)", expected_date: "2026-06-14" },
          { _key: k(), label: "Phase II (if opened)", note: "Adds ~90d" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "CCB",
        outcome: "pending",
        outcome_summary: "Communications Workers of America submitted a letter on December 12, 2025 urging scrutiny.",
        steps: [
          { _key: k(), label: "Notification filed", actual_date: "2025-11-30" },
          { _key: k(), label: "CWA intervention letter", actual_date: "2025-12-12" },
          { _key: k(), label: "Decision", expected_date: "2026-06-15" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "CADE",
        outcome: "cleared",
        steps: [{ _key: k(), label: "CADE clearance", actual_date: "2026-01-10" }],
      },
      {
        _key: k(),
        jurisdiction: "SAMR",
        outcome: "cleared",
        steps: [{ _key: k(), label: "SAMR clearance", actual_date: "2026-01-20" }],
      },
      {
        _key: k(),
        jurisdiction: "Turkey",
        outcome: "cleared",
        steps: [{ _key: k(), label: "Turkish CA clearance", actual_date: "2026-02-15" }],
      },
    ],
    shareholder_vote: {
      outcome: "approved",
      label: "Target shareholders — approved December 22, 2025",
      steps: [
        { _key: k(), label: "Proxy mailed", actual_date: "2025-10-31" },
        { _key: k(), label: "Vote meeting", actual_date: "2025-12-22", note: "Approved" },
      ],
    },
    ctfn_analysis: [
      p("Our 74% probability reflects a relatively clean competition profile offset by political sensitivity around PIF as lead investor. Section 6.5(a) of the merger agreement is favorable to close — parties are not required to agree to any remedy in connection with HSR or CFIUS."),
      p("FSR Phase II would extend timing by 90+ days if invoked. Our base case assumes Phase I clearance subject to limited commitments on subsidy transparency."),
    ],
    risk_factors: [
      p("FSR Phase II escalation pushing close past outside date."),
      p("CFIUS mitigation terms becoming commercially material."),
      p("Political headwinds in US Congress around foreign-SWF ownership of content."),
    ],
    shareholder_activism: [
      {
        _key: k(),
        date: "2025-10-14",
        actor: "Sens. Elizabeth Warren & Richard Blumenthal",
        stance: "opposed",
        description:
          "Senators Warren and Blumenthal sent a joint letter to Treasury Secretary Bessent urging CFIUS to conduct a thorough review of the transaction. The letter flagged concerns about foreign sovereign-wealth ownership of a major US entertainment platform and requested specific mitigation commitments.",
        source_url: "https://www.warren.senate.gov/",
      },
      {
        _key: k(),
        date: "2025-12-12",
        actor: "Communications Workers of America (CWA)",
        stance: "opposed",
        description:
          "CWA submitted a letter to the Canadian Competition Bureau urging careful scrutiny of the transaction's labor implications. The union represents workers at several EA studios and emphasized concerns about headcount reductions and the precedent of SWF ownership in creative industries.",
        source_url: "https://cwa-union.org/",
      },
    ],
    documents: [
      { _key: k(), title: "Press Release", url: "https://www.sec.gov/" },
      { _key: k(), title: "Definitive Merger Agreement", url: "https://www.sec.gov/" },
      { _key: k(), title: "Definitive Proxy", url: "https://www.sec.gov/" },
      { _key: k(), title: "Warren & Blumenthal Letter to Treasury (10/14/25)", url: "https://www.warren.senate.gov/" },
      { _key: k(), title: "CWA Letter to Canadian Competition Bureau (12/12/25)", url: "https://cwa-union.org/" },
    ],
    trigger_alert: false,
    alert_summary: "EA shareholders approve the PIF-led buyout.",
  },

  // 4 ── PEN / BSX — medtech
  {
    acquirer: "Boston Scientific",
    target: "Penumbra",
    acquirer_ticker: "BSX",
    target_ticker: "PEN",
    status: "hsr_waiting",
    sector: "healthcare",
    target_jurisdiction: "Delaware",
    deck: "$14.6bn strategic medtech combination in vascular intervention. FTC second request pending; EC review required.",
    key_risk_summary:
      "FTC second request issued March 16 creates the primary timing and remedy risk — overlap in mechanical thrombectomy for VTE is the likely theory of harm.",
    equity_value: 14600,
    shares_outstanding: 39,
    offer_price: 374,
    offer_terms: "$374 cash or 3.8721 BSX shares per PEN share",
    premium: 19,
    premium_reference: "vs PEN close Jan 14, 2026",
    termination_fee: 525,
    termination_fee_pct: 3.5,
    reverse_termination_fee: 900,
    reverse_termination_fee_pct: 6,
    financing: "BSX to fund $11bn cash portion via balance-sheet cash and new debt.",
    ctfn_closing_probability: 77,
    ctfn_estimated_close: "2026-11-15",
    ctfn_probability_notes: "Clean but for thrombectomy overlap; divestiture most likely remedy.",
    announcement_date: "2026-01-15",
    published_date: "2026-01-15",
    next_key_event_date: "2026-05-06",
    next_key_event_label: "Shareholder vote",
    outside_date: "2027-01-14",
    outside_date_final: "2028-01-14",
    outside_date_notes:
      "Four 3-month extensions available if regulatory approvals are pending.",
    closing_guidance: "2026",
    best_efforts:
      "Parties shall divest assets and defend the transaction in court if needed to obtain regulatory clearance.",
    target_advisors: "Perella Weinberg (exclusive financial). Davis Polk & Wardwell (legal).",
    acquirer_advisors: "Allen Overy Shearman & Sterling and Arnold & Porter Kaye Scholer (legal).",
    free_preview: [
      p("Boston Scientific's $14.6bn acquisition of Penumbra adds scaled mechanical thrombectomy capabilities to BSX's vascular portfolio. Consideration is $374 cash or 3.8721 BSX shares per PEN share, subject to a transaction-wide cap of 73% cash and 27% stock."),
      p("HSR was filed on February 13, 2026; the FTC issued a second request on March 16. The target shareholder vote is May 6. EC approval is also required. The 19% premium reflects PEN's trading strength into the deal."),
    ],
    background: [
      p("On January 14, 2025, Penumbra CEO Adam Elsesser and BSX CEO Michael Mahoney attended a dinner at the JP Morgan Healthcare Conference. In late October 2025, following landmark STORM-PE data, Elsesser spoke informally with BSX executive Joseph Fitzgerald about strategic fit."),
      p("On December 15, Mahoney expressed interest in exploring an acquisition. On December 19 the parties executed a mutual NDA. On December 29, BSX delivered a preliminary proposal at $365 per share (75% cash / 25% stock). On December 31 BSX raised to $370. On January 3, BSX indicated $374 as best and final."),
      p("On January 14, 2026, Penumbra's board received PWP's fairness opinion and unanimously recommended the agreement. The parties executed that day and announced on January 15."),
    ],
    commentary: [
      p("Penumbra is a global healthcare company specializing in mechanical thrombectomy (CAVT) for pulmonary embolism, DVT, acute limb ischemia, and ischemic stroke. Key products: Lightning Bolt, Lightning Flash, Lightning 12."),
      p("Boston Scientific is a global medtech leader in cardiovascular, respiratory, digestive, oncological, neurological, and urological solutions. Key innovations: FARAPULSE PFA System and WATCHMAN."),
      p("Overlap is concentrated in mechanical thrombectomy for venous thromboembolism (VTE). Expected $0.06–$0.08 dilutive to adjusted EPS in year one, neutral to slightly accretive in year two."),
      p("Notable competitors include Inari Medical, Medtronic, Stryker, and Terumo."),
    ],
    filings: [
      {
        _key: k(),
        jurisdiction: "HSR",
        outcome: "conditional",
        outcome_summary: "Second request issued March 16 — FTC focused on thrombectomy overlap for VTE. Divestiture remedy expected.",
        steps: [
          { _key: k(), label: "HSR filed", actual_date: "2026-02-13" },
          { _key: k(), label: "Second request issued", actual_date: "2026-03-16" },
          { _key: k(), label: "Substantial compliance target", expected_date: "2026-07-16" },
          { _key: k(), label: "Waiting period expires", expected_date: "2026-08-15" },
          { _key: k(), label: "Remedy negotiation / divestiture", note: "Most likely outcome" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "EC_Merger",
        outcome: "pending",
        steps: [
          { _key: k(), label: "Pre-notification", actual_date: "2026-03-01" },
          { _key: k(), label: "Notification", expected_date: "2026-05-01" },
          { _key: k(), label: "Phase I decision", expected_date: "2026-06-30" },
        ],
      },
    ],
    shareholder_vote: {
      outcome: "pending",
      label: "Penumbra shareholders — simple majority",
      committed_pct: 14,
      committed_notes: "Management and insiders",
      steps: [
        { _key: k(), label: "Proxy mailed", actual_date: "2026-03-01" },
        { _key: k(), label: "Vote meeting", expected_date: "2026-05-06" },
      ],
    },
    ctfn_analysis: [
      p("Our 77% probability reflects a strong strategic rationale offset by a clear product overlap in thrombectomy. We expect a divestiture remedy — most likely a single product line with associated IP — rather than an outright block."),
      p("The 6% reverse termination fee gives PEN shareholders meaningful downside protection if the FTC blocks the deal without an accepted remedy."),
    ],
    risk_factors: [
      p("FTC insistence on a divestee that lacks scale to sustain the divested business."),
      p("EC parallel review producing inconsistent remedies."),
    ],
    documents: [
      { _key: k(), title: "Press Release", url: "https://www.sec.gov/" },
      { _key: k(), title: "Definitive Merger Agreement", url: "https://www.sec.gov/" },
      { _key: k(), title: "Definitive Proxy Statement", url: "https://www.sec.gov/" },
    ],
    trigger_alert: false,
    alert_summary: "FTC issues a second request; we now expect a divestiture remedy.",
  },
];

async function run() {
  console.log(`Seeding ${deals.length} deals to ${projectId}/${dataset}…`);

  // Wipe existing demo deals so a rerun truly reflects the new data
  await client.delete({ query: '*[_type == "deal"]' });

  for (const d of deals) {
    const slug = slugify(d.acquirer, d.target);
    const doc = {
      _id: `deal-${slug}`,
      _type: "deal",
      ...d,
      slug: { _type: "slug", current: slug },
    };
    const res = await client.createOrReplace(doc);
    console.log(`  ✓ ${d.acquirer} / ${d.target} (${res._id})`);
  }
  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
