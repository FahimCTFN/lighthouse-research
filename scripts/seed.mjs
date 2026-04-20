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
    status: "ongoing",
    sector: "media_telecom",
    target_jurisdiction: "Delaware",
    deck: "Shareholder vote in 2 days. California AG investigation is the live risk. ISS and Glass Lewis back approval but reject Zaslav's $886mn parachute.",
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
      p("On June 9, 2025, Warner Bros. Discovery announced it would explore strategic alternatives, including a potential separation of its streaming and studios businesses. The board authorized management to evaluate inbound interest."),
      p("In Q1 2024, WBD senior management had reviewed Paramount Global as a potential counterparty but did not submit a proposal at that time. On September 14, 2025, David Ellison proposed a takeover at ~$19 per share; the target board rejected it as inadequate. On September 30, Paramount raised to ~$22 per share; rejected again."),
      p("On October 13, 2025, Paramount submitted ~$23.50 per share. On October 16, Netflix and Company A expressed interest. On October 20, the target board authorized a broader strategic review. On October 21, WBD issued a public press release confirming the strategic review. Between October 21 and November 10, WBD contacted ~13 potential counterparties."),
      p("November 20 first-round bids: Paramount at $25.50, Netflix at $27 for Streaming & Studios, Company A at $33.25 headline. On December 1, Paramount raised to $26.50 all-cash; Netflix raised to $27.75. On December 4, Paramount submitted $30 all-cash; Netflix issued a best-and-final deadline; WBD signed the Netflix merger agreement."),
      p("On December 8, Paramount launched an unsolicited tender offer at $30. A bidding war ensued through February 2026. On February 10, Paramount submitted an enhanced bid. On February 21, Paramount proposed $31 plus ticking consideration of $0.25 per share per quarter (measured daily, commencing after September 30, 2026) with a $7bn reverse termination fee. On February 26, Paramount delivered its binding proposal at $31; Netflix declined to match. On February 27, the deal was announced."),
      p("Paramount Skydance paid WBD's $2.8bn termination fee for breaking the Netflix merger agreement. The Ellison Parties — Lawrence J. Ellison Trust and RedBird Capital Partners — signed a comprehensive guarantee covering billions in merger consideration, termination fees, and potential damages. Over 1,000 prominent Hollywood creatives subsequently signed a letter against the deal, warning of job losses and less choice for audiences."),
    ],
    commentary: [
      p("Paramount Skydance paid WBD's $2.8bn termination fee for breaking the Netflix merger agreement. The Ellison Parties signed a comprehensive guarantee covering billions in merger consideration, termination fees, and potential damages."),
      p("The European Commission review remains the most consequential outstanding regulatory approval. CTFN has reported that the parties are likely to divest children's-television assets to resolve horizontal overlaps. EU Foreign Subsidies Regulation clearance is also required."),
      p("Over 1,000 prominent Hollywood creatives signed a letter against the deal warning of job losses and less choice for audiences. Political opposition has been vocal, though formal antitrust theories remain concentrated in California."),
      p("The UK Competition and Markets Authority invited public comment on the proposed merger; the deadline for the invitation to comment is April 27."),
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
        outcome_summary: "Pre-notification ongoing. Children's-TV divestitures likely as remedy to resolve horizontal overlaps. Sources expect easy Phase I clearance — combined market share below 20% across all European markets.",
        steps: [
          { _key: k(), label: "Pre-notification discussions", actual_date: "2026-03-10" },
          { _key: k(), label: "Formal notification", expected_date: "2026-05-01", note: "Expected after April 23 shareholder vote" },
          { _key: k(), label: "Phase I decision (25 working days)", expected_date: "2026-06-12" },
          { _key: k(), label: "Phase II (if escalated)", note: "90 working days + 15 if remedies" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "CMA",
        outcome: "pending",
        outcome_summary: "CMA opened case April 13 and invited public comment. Phase 1 investigation expected to launch after comment period closes. Analysts expect straightforward Phase 1 clearance — combined market share below 20% in UK.",
        case_url: "https://www.gov.uk/cma-cases/paramount-slash-warner-bros-discovery-merger-inquiry",
        steps: [
          { _key: k(), label: "CMA case opened + invitation to comment", actual_date: "2026-04-13" },
          { _key: k(), label: "Comment period closes", expected_date: "2026-04-27" },
          { _key: k(), label: "Phase 1 investigation launched", expected_date: "2026-05-05", note: "Expected in weeks following comment period" },
          { _key: k(), label: "Phase 1 decision (40 working days)", expected_date: "2026-07-01" },
          { _key: k(), label: "Phase 2 (if referred)", note: "Up to 24 weeks" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "State_AG",
        display_name: "California Attorney General",
        outcome: "conditional",
        outcome_summary: "AG Rob Bonta has directed the California DOJ to open an investigation. AG may pursue litigation rather than a negotiated consent decree — the primary deal risk. LA County supervisors ordered an economic analysis: interim report due May 24, final recommendations by July 23.",
        case_url: "https://oag.ca.gov/news/press-releases/attorney-general-bonta-issues-statement-proposed-warner-bros-mergers-california",
        steps: [
          { _key: k(), label: "Investigation opened", actual_date: "2026-03-15" },
          { _key: k(), label: "LA County interim economic report", expected_date: "2026-05-24" },
          { _key: k(), label: "LA County final recommendations", expected_date: "2026-07-23" },
          { _key: k(), label: "AG decision / filing", note: "Timing uncertain — litigation or negotiated resolution" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "EC_FSR",
        display_name: "EU Foreign Subsidies Regulation",
        outcome: "pending",
        outcome_summary: "FSR clearance required due to backing from PIF (Saudi), QIA (Qatar), and L'imad Holding (Abu Dhabi). EC has sent RFIs related to foreign subsidies. Pre-notification ongoing.",
        steps: [
          { _key: k(), label: "EC sent RFIs on foreign subsidies", actual_date: "2026-03-15" },
          { _key: k(), label: "FSR formal notification", expected_date: "2026-05-01", note: "Expected concurrent with EC merger control filing" },
          { _key: k(), label: "FSR Phase I decision (25 working days)", expected_date: "2026-06-12" },
          { _key: k(), label: "FSR Phase II (if opened)", note: "Up to 90 working days + 15 days" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "CADE",
        outcome: "pending",
        outcome_summary: "Brazilian antitrust notification filed March 31, 2026. Fast-track clearance possible within 30 days for non-complex deals; standard review up to 240 days.",
        steps: [
          { _key: k(), label: "CADE notification filed", actual_date: "2026-03-31" },
          { _key: k(), label: "CADE decision (fast-track: 30d / standard: 240d)", expected_date: "2026-05-01" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "CCB",
        display_name: "Canada Competition Bureau",
        outcome: "pending",
        outcome_summary: "Canada Competition Bureau announced review on March 26. Standard SIR timeline typically 30 days.",
        steps: [
          { _key: k(), label: "Competition Bureau review announced", actual_date: "2026-03-26" },
          { _key: k(), label: "SIR decision", expected_date: "2026-05-15" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "FDI",
        display_name: "Germany — BMWK (FDI)",
        outcome: "cleared",
        outcome_summary:
          "German Foreign Direct Investment screening cleared under the AWG/AWV regime by the Federal Ministry for Economic Affairs and Climate Action (BMWK). This is national security / investment-screening review, distinct from merger control (no BKartA filing has been publicly documented).",
        case_url: "https://www.prnewswire.com/news-releases/paramount-enhances-its-superior-30-per-share-all-cash-offer-for-warner-bros-discovery-and-provides-update-on-regulatory-progress-302683694.html",
        steps: [
          { _key: k(), label: "FDI clearance (BMWK)", actual_date: "2026-01-27" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "FDI",
        display_name: "Slovenia — MGTŠ (FDI)",
        outcome: "cleared",
        outcome_summary:
          "Slovenian FDI screening cleared by the Ministry of the Economy, Tourism and Sport (MGTŠ) under the ZSInv regime. Specific clearance date not publicly disclosed; Paramount CSO Andy Gordon confirmed approval on an early-March 2026 investor call. This is national security / investment-screening review, not competition merger control.",
        steps: [
          { _key: k(), label: "FDI clearance publicly confirmed", actual_date: "2026-03-03", note: "Cleared on or before this date; specific clearance date not publicly disclosed (Paramount CSO Andy Gordon confirmed on investor call)" },
        ],
      },
    ],
    shareholder_votes: [{ party: "target",
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
    }],
    ctfn_probability: [
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
      { _key: k(), title: "Press Release — Merger Announcement (2/27/26)", url: "https://www.prnewswire.com/news-releases/paramount-to-acquire-warner-bros-discovery-to-form-next-generation-global-media-and-entertainment-company-302699998.html" },
      { _key: k(), title: "Definitive Merger Agreement", url: "https://www.sec.gov/Archives/edgar/data/1437107/000110465926021914/tm2533570d75_ex10-2.htm" },
      { _key: k(), title: "Definitive Proxy Statement (DEFM14A)", url: "https://www.sec.gov/Archives/edgar/data/1437107/000119312526053002/d304272ddefm14a.htm" },
      { _key: k(), title: "WBD Strategic Review Press Release (10/21/25)", url: "https://www.prnewswire.com/news-releases/warner-bros-discovery-initiates-review-of-potential-alternatives-to-maximize-shareholder-value-302590176.html" },
      { _key: k(), title: "Enhanced Paramount Bid (2/10/26)", url: "https://www.prnewswire.com/news-releases/paramount-enhances-its-superior-30-per-share-all-cash-offer-for-warner-bros-discovery-and-provides-update-on-regulatory-progress-302683694.html" },
      { _key: k(), title: "Paramount SC 14D9 — Initial Tender Offer (12/8/25)", url: "https://www.sec.gov/Archives/edgar/data/1437107/000119312525321674/d78122dsc14d9.htm" },
      { _key: k(), title: "WBD Shareholder Meeting Announcement", url: "https://www.prnewswire.com/news-releases/warner-bros-discovery-sets-shareholder-meeting-date-of-april-23-2026-to-approve-transaction-with-paramount-skydance-302726244.html" },
      { _key: k(), title: "CMA Merger Inquiry Case Page", url: "https://www.gov.uk/cma-cases/paramount-slash-warner-bros-discovery-merger-inquiry" },
    ],
    allow_single_purchase: true,
    single_purchase_price: 99,
    trigger_alert: false,
    alert_summary: "ISS and Glass Lewis recommend approval ahead of the April 23 shareholder vote.",
  },

  // 2 ── NSC / UNP — largest rail deal in US history
  {
    acquirer: "Union Pacific",
    target: "Norfolk Southern",
    acquirer_ticker: "UNP",
    target_ticker: "NSC",
    status: "ongoing",
    sector: "industrials",
    target_jurisdiction: "Virginia",
    deck: "First transcontinental Class I rail merger tested under the STB's 2001 enhanced-competition standard. HSR-style document submission to DOJ/STB due April 7; application refiling on April 30. BNSF and industry groups organizing opposition.",
    key_risk_summary:
      "Significant pushback from industry groups will have an impact on the STB's review, especially if there is a lack of support for the deal. This input is led by the American Chemistry Council as well as from the Chlorine Institute, America's Power, the Agricultural Retailers Association, automotive OEMs and others, as well as competitors such as BNSF, which has been outspoken against the deal.",
    equity_value: 71900,
    shares_outstanding: 224,
    offer_price: 320,
    offer_terms: "1.0 UP share + $88.82 cash per NSC share (~$320 headline)",
    premium: 25,
    premium_reference: "25% to NSC 30-day VWAP on July 16, or 22.9% to unaffected close on July 16",
    termination_fee: 2500,
    termination_fee_pct: 3.5,
    reverse_termination_fee: 2500,
    reverse_termination_fee_pct: 3.5,
    financing:
      "Cash portion funded through a combination of new debt and balance-sheet cash. Union Pacific will issue ~225mn shares to NSC holders, representing ~27% of the combined company on a fully diluted basis.",
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
      "The parties are not obligated to divest any assets but will defend the transaction through litigation if necessary.",
    target_advisors:
      "BofA (exclusive financial). Wachtell, Lipton, Rosen & Katz (legal); Sidley Austin (regulatory).",
    acquirer_advisors:
      "Morgan Stanley and Wells Fargo (financial). Skadden Arps (legal); Covington & Burling (regulatory).",
    free_preview: [
      p("Union Pacific's ~$72bn acquisition of Norfolk Southern would create the first coast-to-coast Class I railroad. Norfolk Southern shareholders will receive one Union Pacific common share and $88.82 in cash for each share of Norfolk Southern, implying a $320-per-share offer."),
      p("It is the first major rail merger evaluated under the STB's 2001 rules, which require Class I mergers to enhance competition — not merely preserve it. On January 16, 2026 the STB unanimously rejected the parties' initial application as incomplete. Refiling is scheduled for April 30, 2026; the deadline is June 22."),
    ],
    background: [
      p("On Dec 12–13, 2024, Union Pacific CEO V. James Vena raised a transcontinental railroad merger at a UP board dinner. On Dec 18, Norfolk Southern CEO Mark R. George discussed the concept with Vena. On Jan 28, 2025, NSC's board agreed to evaluate a transcontinental merger concept."),
      p("Late Jan–Feb 2025, Vena and UP Chair Michael R. McCarthy discussed acquiring NSC or another railroad; UP engaged Morgan Stanley and Wells Fargo. On Mar 18, George and Vena discussed timing at an AAR meeting in Washington, D.C. On May 15, senior teams met; UP expressed strong interest and identified NSC as its optimal counterparty."),
      p("On Jun 20, UP authorized a preliminary, non-binding all-stock IOI: 1.261 UP shares per NSC share (~$280 per NSC share; ~11% premium). NSC told UP the June Proposal was inadequate."),
      p("On July 16, UP's board authorized a revised IOI: $310 per NSC share (~70% stock / 30% cash) and a 3% RT fee if regulatory approvals failed. On July 20, UP delivered the 'July 20 Proposal': 0.9387 UP shares + $93 cash per NSC share (~$310 value)."),
      p("On July 21, NSC sent the 'July 21 Counterproposal': 1.0000 UP share + $100 cash per NSC share (~$331). On July 22, UP delivered its 'Final Proposal': 1.0000 UP share plus cash valuing NSC at $320 per share (~25% premium), a $2.5bn RT fee, three NSC directors on the combined board."),
      p("On July 28, both boards unanimously approved and executed the merger agreement. On July 29, NSC and UP issued a joint press release announcing execution of the merger agreement."),
    ],
    commentary: [
      p("Union Pacific will issue about 225mn shares to Norfolk Southern shareholders, representing 27% ownership in the combined company on a fully diluted basis."),
      p("As of early October 2025, BNSF has a webpage titled 'Preserve Rail Competition' directing users to file letters with the STB opposing the deal. Industry opposition is broader and more organized than any recent Class I merger."),
      p("This is the first major rail merger evaluated under the STB's 2001 rules, which require Class I mergers to enhance competition, not just maintain it. The December 2025 application was filed under Docket No. FD 36873."),
      p("Approval is also required from the US Federal Communications Commission and the Comisión Nacional Antimonopolio (the Mexican National Antitrust Commission)."),
    ],
    filings: [
      {
        _key: k(),
        jurisdiction: "STB",
        outcome: "conditional",
        outcome_summary: "First Class I merger tested under the STB's 2001 enhance-competition standard. Application rejected as incomplete in January citing failure to provide a full-system competitive impact analysis and omission of Schedule 5.8. Refiling April 30; deadline June 22. Once accepted, the process involves a 45-day public comment window, 90-day responsive applications window, then evidentiary record-building.",
        case_url: "https://www.stb.gov/resources/major-railroad-mergers/",
        steps: [
          { _key: k(), label: "STB acknowledged notice of intent", actual_date: "2025-07-30" },
          { _key: k(), label: "Full merger application filed", actual_date: "2025-12-19", note: "Docket No. FD 36873" },
          { _key: k(), label: "STB unanimously rejected application", actual_date: "2026-01-16", note: "Cited failure to provide full-system competitive impact analysis with forward-looking projections and omission of Schedule 5.8 covering 'Materially Burdensome Regulatory Condition' language" },
          { _key: k(), label: "Companies informed STB of refiling plan", actual_date: "2026-02-17", note: "Plan to refile April 30; deadline June 22" },
          { _key: k(), label: "DOJ brief suggesting HSR-style documents", actual_date: "2026-03-03", note: "DOJ urged STB to order ordinary-course business documents from applicants" },
          { _key: k(), label: "STB ordered document production", actual_date: "2026-03-18", note: "Parties must comply by April 7" },
          { _key: k(), label: "HSR-style documents due to DOJ/STB", expected_date: "2026-04-07" },
          { _key: k(), label: "Application refiling", expected_date: "2026-04-30", note: "Refiling deadline is June 22, 2026" },
          { _key: k(), label: "STB acceptance of refiling", expected_date: "2026-06-15" },
          { _key: k(), label: "Public comment period (45 days)", expected_date: "2026-07-30" },
          { _key: k(), label: "Responsive applications window (90 days)", expected_date: "2026-10-28" },
          { _key: k(), label: "Evidentiary record-building phase", note: "Duration TBD by STB" },
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
        jurisdiction: "COFECE",
        outcome: "pending",
        outcome_summary: "Comisión Federal de Competencia Económica — cross-border operations require Mexican clearance.",
        steps: [
          { _key: k(), label: "Notification", expected_date: "2026-06-15" },
          { _key: k(), label: "Decision", expected_date: "2027-01-15" },
        ],
      },
    ],
    shareholder_votes: [{ party: "target",
      outcome: "approved",
      label: "Target shareholders — approved November 14, 2025",
      steps: [
        { _key: k(), label: "Proxy mailed", actual_date: "2025-10-01" },
        { _key: k(), label: "Vote meeting", actual_date: "2025-11-14", note: "Approved" },
      ],
    }],
    ctfn_probability: [
      p("Our 58% probability reflects the novelty of the STB standard. There is no direct precedent for how the 2001 rules are applied to a transcontinental Class I combination. The rules require mergers to enhance competition, not just maintain it — a materially higher bar than the HSR standard."),
      p("The January 2026 application rejection was substantive — the STB unanimously cited two major deficiencies: failure to provide a full-system competitive impact analysis with forward-looking projections and the omission of Schedule 5.8 covering the 'Materially Burdensome Regulatory Condition' language. This suggests the parties' initial approach may not survive the enhanced standard without meaningful remedies."),
      p("DOJ's March 2026 brief suggesting the STB order HSR-style ordinary-course business documents is an unusual level of engagement in a proceeding formally governed by the STB, and signals the Division's intent to shape the evidentiary record."),
    ],
    risk_factors: [
      p("STB's 'enhance competition' standard has no modern precedent; interpretation could demand trackage-rights remedies, haulage arrangements, or divestiture of certain interline agreements."),
      p("BNSF's organized 'Preserve Rail Competition' opposition campaign may drive significant shipper participation in the STB comment period."),
      p("Industry group opposition is broader and more coordinated than any recent Class I merger — American Chemistry Council, Chlorine Institute, America's Power, Agricultural Retailers Association, and automotive OEMs are all active."),
      p("FCC approval required for transfer of wireless and satellite licenses."),
      p("Mexican antitrust (Comisión Nacional Antimonopolio) approval required for cross-border operations."),
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
      { _key: k(), title: "Press Release — Union Pacific (7/29/25)", url: "https://www.up.com/press-releases/growth/norfolk-southern-transcontinental-nr-250729" },
      { _key: k(), title: "Press Release — Norfolk Southern (7/29/25)", url: "https://www.norfolksouthern.com/en/newsroom/news-releases/union-pacific-and-norfolk-southern-to-create-america-s-first-transcontinental-railroad" },
      { _key: k(), title: "Definitive Merger Agreement (UNP 8-K)", url: "https://www.sec.gov/Archives/edgar/data/100885/000119312525168150/d51641d8k.htm" },
      { _key: k(), title: "Joint Proxy / Prospectus (S-4)", url: "https://www.sec.gov/Archives/edgar/data/100885/000119312525204376/d908896ds4.htm" },
      { _key: k(), title: "Definitive Proxy Statement (DEFM14A)", url: "https://www.sec.gov/Archives/edgar/data/702165/000119312525226601/d64358ddefm14a.htm" },
      { _key: k(), title: "STB Major Merger Application (12/19/25)", url: "https://www.stb.gov/news-communications/latest-news/pr-25-38/" },
      { _key: k(), title: "STB Rejection Decision (1/16/26)", url: "https://www.stb.gov/wp-content/uploads/Jan-16-2026-STB-Decision-in-UP-NS-Merger-FD-36873.pdf" },
      { _key: k(), title: "STB Merger Resources Page (FD 36873)", url: "https://www.stb.gov/resources/major-railroad-mergers/" },
      { _key: k(), title: "Investor Presentation", url: "https://norfolksouthern.investorroom.com/image/America's_First_Transcontinental_Railroad.pdf" },
    ],
    allow_single_purchase: true,
    single_purchase_price: 99,
    trigger_alert: false,
    alert_summary: "STB orders parties to produce HSR-style documents by April 7.",
  },

  // 3 ── EA / PIF, Silver Lake, Affinity
  {
    acquirer: "PIF / Silver Lake / Affinity Partners",
    target: "Electronic Arts",
    target_ticker: "EA",
    status: "ongoing",
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
      p("Since 2020, EA's board and senior management periodically evaluated strategic options — including potential partnerships, business combinations and a sale. During this period, Saudi Arabia's Public Investment Fund (PIF) steadily increased its stake, disclosing 5% ownership in February 2022 and 9.2% in February 2024."),
      p("On March 2, 2025, Silver Lake sent CEO Andrew Wilson a presentation, noting it had been shared with Affinity and suggesting PIF as a potential co-investor. By May, EA management and a consortium of PIF, Silver Lake and Affinity held informal talks. In early July, all three signed NDAs."),
      p("On September 12, the consortium proposed acquiring EA for $200 per share; the board directed management to seek $210–$212. After back-and-forth, the consortium agreed to $210 on September 26. On September 28, the board unanimously approved the deal; Goldman Sachs delivered its fairness opinion."),
    ],
    commentary: [
      p("The transaction includes a 45-day window-shop period which ended on November 12. If a superior proposal had been received, the window shop would have been extended by another 30 days. No superior proposal surfaced."),
      p("Electronic Arts is a global interactive entertainment company. Key franchises include EA Sports FC, Madden NFL, The Sims, Battlefield, and Apex Legends."),
      p("Oak-Eagle AcquireCo completed its high-yield debt offering, placing $2.875bn of 7.250% senior secured notes due 2033, €1.08bn of 6.250% senior secured euro notes due 2033, and $2.5bn of 8.750% senior notes due 2034 into escrow pending deal completion."),
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
        outcome_summary: "Mandatory CFIUS declaration required — PIF acquiring >25% in a company with personal data on >1 million US persons (EA has ~700 million player accounts). Former Treasury officials suggest approval likely with limited mitigation measures (data governance / ring-fencing of US player data). Determination could be imminent.",
        steps: [
          { _key: k(), label: "CFIUS declaration filed", actual_date: "2025-11-05", note: "Filed concurrent with HSR" },
          { _key: k(), label: "Full notice requested by CFIUS", actual_date: "2025-12-01" },
          { _key: k(), label: "Phase 1 review (45 days)", actual_date: "2025-12-01", note: "Through mid-January 2026" },
          { _key: k(), label: "Phase 2 investigation (45 days)", actual_date: "2026-01-15", note: "Through late February / early March 2026" },
          { _key: k(), label: "Mitigation agreement negotiation", expected_date: "2026-04-30", note: "Data governance / player data ring-fencing expected" },
          { _key: k(), label: "Final determination / Presidential review (15d)", expected_date: "2026-05-15" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "EC_Merger",
        outcome: "pending",
        outcome_summary: "EC has sent RFIs to European game developers. Some sources report UK/China already cleared. EC Phase I clearance likely — limited overlap in European gaming market.",
        steps: [
          { _key: k(), label: "EC sent RFIs to EU game developers", actual_date: "2026-03-01" },
          { _key: k(), label: "Pre-notification discussions", actual_date: "2026-03-15" },
          { _key: k(), label: "Formal notification", expected_date: "2026-04-15" },
          { _key: k(), label: "Phase I decision (25 working days)", expected_date: "2026-05-23" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "EC_FSR",
        outcome: "pending",
        outcome_summary: "Foreign Subsidies Regulation review of PIF's ~$36bn equity commitment. Phase II would extend timing by 90+ working days past outside date.",
        steps: [
          { _key: k(), label: "Pre-notification discussions", actual_date: "2026-03-15" },
          { _key: k(), label: "FSR formal notification", expected_date: "2026-04-15", note: "Expected concurrent with EC merger control" },
          { _key: k(), label: "FSR Phase I decision (25 working days)", expected_date: "2026-05-23" },
          { _key: k(), label: "FSR Phase II (if opened)", note: "Up to 90 working days — would push past outside date" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "CCB",
        outcome: "pending",
        outcome_summary: "Notification filed. CWA submitted letter December 12, 2025 urging scrutiny of labor implications. Standard SIR timeline.",
        steps: [
          { _key: k(), label: "Notification filed", actual_date: "2025-11-30" },
          { _key: k(), label: "CWA intervention letter", actual_date: "2025-12-12" },
          { _key: k(), label: "Decision", expected_date: "2026-05-30" },
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
    shareholder_votes: [{ party: "target",
      outcome: "approved",
      label: "Target shareholders — approved December 22, 2025",
      steps: [
        { _key: k(), label: "Proxy mailed", actual_date: "2025-10-31" },
        { _key: k(), label: "Vote meeting", actual_date: "2025-12-22", note: "Approved" },
      ],
    }],
    ctfn_probability: [
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
      { _key: k(), title: "Press Release (9/28/25)", url: "https://ir.ea.com/press-releases/press-release-details/2025/EA-Announces-Agreement-to-be-Acquired-by-PIF-Silver-Lake-and-Affinity-Partners-for-55-Billion/" },
      { _key: k(), title: "8-K Filing", url: "https://www.sec.gov/Archives/edgar/data/712515/000114036125036415/ef20056167_8k.htm" },
      { _key: k(), title: "Definitive Proxy Statement (DEFM14A)", url: "https://www.sec.gov/Archives/edgar/data/712515/000114036125042872/ny20056157x2_defm14a.htm" },
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
    status: "ongoing",
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
      p("Boston Scientific's $14.6bn acquisition of Penumbra adds scaled mechanical thrombectomy capabilities to BSX's vascular portfolio. Target shareholders can choose either stock ($374 cash) or shares (3.8721 BSX common shares per PEN share), subject to a transaction-wide cap of 73% in cash and 27% in Boston Scientific common stock."),
      p("HSR was filed on February 13, 2026; the FTC issued a second request on March 16. The target shareholder vote is May 6. EC approval is also required. Boston Scientific expects to finance the $11bn cash portion with a combination of cash on hand and new debt."),
    ],
    background: [
      p("On January 14, 2025, Penumbra CEO Adam Elsesser and Boston Scientific CEO Michael Mahoney attended a dinner at the JP Morgan Healthcare Conference. In late October 2025, following landmark STORM-PE data, Elsesser spoke informally with BSX executive Joseph Fitzgerald about strategic fit."),
      p("On December 15, Mahoney expressed interest in exploring an acquisition. On December 19, the parties executed a mutual NDA. On December 29, BSX delivered a preliminary proposal at $365 per share (75% cash / 25% stock). On December 31, BSX raised to $370."),
      p("On January 3, BSX indicated $374 as 'best and final.' On January 14, 2026, Penumbra's board received PWP's fairness opinion and unanimously recommended the merger agreement. The parties executed the agreement that day and announced on January 15."),
    ],
    commentary: [
      p("Penumbra is a global healthcare company specializing in mechanical thrombectomy technologies (CAVT) for treating pulmonary embolism, DVT, acute limb ischemia, and ischemic stroke. Key products include Lightning Bolt, Lightning Flash, and Lightning 12 systems."),
      p("Boston Scientific is a global medical technology leader in cardiovascular, respiratory, digestive, oncological, neurological, and urological solutions. Key innovations include the FARAPULSE PFA System and WATCHMAN device."),
      p("Significant overlap exists in Vascular Intervention and Peripheral Vascular markets, particularly in thrombectomy systems for treating venous thromboembolism (VTE). The transaction provides BSX with scaled entry into the high-growth mechanical thrombectomy market."),
      p("Expected $0.06–$0.08 dilutive to adjusted EPS in year one, neutral to slightly accretive in year two. Notable competitors include Inari Medical, Medtronic, Stryker, and Terumo."),
    ],
    filings: [
      {
        _key: k(),
        jurisdiction: "HSR",
        outcome: "conditional",
        outcome_summary: "Second request issued March 16 — FTC focused on Vascular Intervention and Peripheral Vascular overlap, particularly thrombectomy systems for VTE. Substantial compliance typically takes 3–6 months. Divestiture remedy expected (single product line with associated IP).",
        steps: [
          { _key: k(), label: "HSR filed", actual_date: "2026-02-13" },
          { _key: k(), label: "Second request issued by FTC", actual_date: "2026-03-16" },
          { _key: k(), label: "Substantial compliance (est. 3-6 months)", expected_date: "2026-07-16", note: "Both parties must certify compliance" },
          { _key: k(), label: "30-day waiting period expires", expected_date: "2026-08-15" },
          { _key: k(), label: "FTC decision: clear, consent decree, or challenge", expected_date: "2026-09-30", note: "Divestiture most likely outcome" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "EC_Merger",
        outcome: "pending",
        outcome_summary: "EC notification required — BSX (FY2025 revenue ~$17bn globally) and Penumbra (~$1bn) exceed EU Merger Regulation thresholds. Pre-notification likely underway.",
        steps: [
          { _key: k(), label: "Pre-notification", actual_date: "2026-03-01" },
          { _key: k(), label: "Formal notification", expected_date: "2026-05-01" },
          { _key: k(), label: "Phase I decision (25 working days)", expected_date: "2026-06-12" },
          { _key: k(), label: "Phase II (if triggered)", note: "Up to 90 working days" },
        ],
      },
    ],
    shareholder_votes: [{ party: "target",
      outcome: "pending",
      label: "Penumbra shareholders — simple majority",
      committed_pct: 14,
      committed_notes: "Management and insiders",
      steps: [
        { _key: k(), label: "Proxy mailed", actual_date: "2026-03-01" },
        { _key: k(), label: "Vote meeting", expected_date: "2026-05-06" },
      ],
    }],
    ctfn_probability: [
      p("Our 77% probability reflects a strong strategic rationale offset by a clear product overlap in thrombectomy. We expect a divestiture remedy — most likely a single product line with associated IP — rather than an outright block."),
      p("The 6% reverse termination fee gives PEN shareholders meaningful downside protection if the FTC blocks the deal without an accepted remedy."),
    ],
    risk_factors: [
      p("FTC insistence on a divestee that lacks scale to sustain the divested business."),
      p("EC parallel review producing inconsistent remedies."),
    ],
    documents: [
      { _key: k(), title: "Press Release (1/15/26)", url: "https://news.bostonscientific.com/2026-01-15-Boston-Scientific-announces-agreement-to-acquire-Penumbra,-Inc" },
      { _key: k(), title: "Merger Communications (Form 425)", url: "https://www.sec.gov/Archives/edgar/data/1321732/000095010326000558/dp240020_425.htm" },
    ],
    trigger_alert: false,
    alert_summary: "FTC issues a second request; we now expect a divestiture remedy.",
  },

  // 5 ── KVUE / KMB — consumer health mega-merger
  {
    acquirer: "Kimberly-Clark",
    target: "Kenvue",
    acquirer_ticker: "KMB",
    target_ticker: "KVUE",
    status: "ongoing",
    sector: "consumer",
    target_jurisdiction: "Delaware",
    deck: "Shareholders overwhelmingly approved (96-99%). FTC second request is the primary gating item. Divestitures likely in feminine hygiene (NZ/AU already proposed). KMB announced post-closing org structure April 15.",
    key_risk_summary:
      "FTC second request focusing on concentrated market share in baby care (Huggies vs Johnson's Baby), feminine hygiene (Kotex vs Stayfree/Carefree), and OTC health. Divestitures in multiple geographies likely required — NZ/AU feminine hygiene divestiture already proposed to regulators.",
    equity_value: 40000,
    shares_outstanding: 1903,
    offer_price: 21.01,
    offer_terms: "$3.50 cash + 0.14625 KMB shares per KVUE share (~$21.01)",
    premium: 46,
    premium_reference: "vs KVUE close $14.37 on Oct 31, 2025",
    termination_fee: 1136,
    termination_fee_pct: 2.8,
    reverse_termination_fee: 1136,
    reverse_termination_fee_pct: 2.8,
    termination_fee_notes:
      "Reciprocal $1.136bn termination fee payable by either party in competing-transaction or board recommendation-change scenarios.",
    financing:
      "Cash component (~$6.7bn) funded via cash on hand, new debt issuance, and proceeds from previously announced sale of 51% of KMB's International Family Care and Professional business. $7.7bn committed bridge facility from JPMorgan Chase. Combined ownership at close: KMB ~54%, KVUE ~46%.",
    ctfn_estimated_close: "2026-10-15",
    ctfn_probability_notes:
      "Strong shareholder support (96-99%) removes vote risk. FTC second request + required divestitures are the primary variables. Multiple jurisdictions still outstanding.",
    announcement_date: "2025-11-03",
    published_date: "2025-11-03",
    next_key_event_date: "2026-07-15",
    next_key_event_label: "FTC substantial compliance target",
    outside_date: "2026-11-02",
    outside_date_final: "2027-05-03",
    outside_date_notes:
      "Automatic extension to May 3, 2027 if regulatory approvals remain pending.",
    closing_guidance: "H2 2026",
    best_efforts:
      "Reasonable best efforts standard for regulatory approvals, subject to specified limitations in the merger agreement.",
    target_advisors:
      "Centerview Partners and Goldman Sachs (financial). Cravath, Swaine & Moore (legal — 13-partner team).",
    acquirer_advisors:
      "J.P. Morgan and PJT Partners (financial). Kirkland & Ellis (legal).",
    free_preview: [
      p("Kimberly-Clark's $48.7bn acquisition of Kenvue creates a $32 billion global health and wellness leader combining KMB's Huggies, Kleenex, and Kotex with Kenvue's Tylenol, Band-Aid, Neutrogena, Listerine, and Aveeno. Consideration is $3.50 cash plus 0.14625 KMB shares per KVUE share, implying ~$21.01 per share — a 46% premium."),
      p("Both shareholder bases overwhelmingly approved the transaction on January 29, 2026 (~96% KMB, ~99% KVUE). HSR expired February 4, but the FTC issued a second request. Competitive overlaps in baby care, feminine hygiene, and OTC health make divestitures likely. KMB announced post-closing organizational structure and leadership on April 15, 2026 — a sign of active integration planning."),
    ],
    background: [
      p("Kenvue was spun out of Johnson & Johnson in May 2023 via the largest consumer health IPO in history. Shares subsequently fell ~35% from the IPO price, prompting activist interest."),
      p("Starboard Value CEO Jeffrey Smith began building a significant position in late 2024, arguing Kenvue's iconic brands were undervalued under the existing management structure. By March 2025, Starboard secured a board seat and pushed for a 'comprehensive review of strategic alternatives.'"),
      p("The strategic review process ran through the summer and fall of 2025. Kimberly-Clark emerged as the acquirer, with the merger agreement signed on November 2, 2025 and announced November 3."),
      p("Starboard publicly described KMB and KVUE as overlapping 'beautifully' — the deal was effectively activist-driven, with the strategic review initiated at Starboard's insistence."),
    ],
    commentary: [
      p("The combined company targets $1.9bn in cost synergies and $500mn in incremental revenue synergy profit, partially offset by $300mn in reinvestment. At ~14x adjusted EBITDA, the acquisition multiple reflects Kenvue's depressed post-spin trading rather than intrinsic brand value."),
      p("Kenvue's portfolio — Tylenol, Band-Aid, Neutrogena, Listerine, Aveeno, Johnson's Baby — represents some of the most recognized consumer health brands globally. KMB's operational discipline in supply chain and distribution is expected to be a key value driver post-close."),
      p("On April 15, 2026, Kimberly-Clark announced the post-closing organizational structure and identified key leadership positions — a strong signal of integration confidence ahead of regulatory clearance."),
    ],
    filings: [
      {
        _key: k(),
        jurisdiction: "HSR",
        outcome: "conditional",
        outcome_summary: "HSR waiting period expired February 4, 2026. However, FTC issued a second request for more intensive review. Focus: market concentration in baby care, feminine hygiene, and OTC health. Divestitures likely required.",
        steps: [
          { _key: k(), label: "HSR filed", actual_date: "2025-12-01" },
          { _key: k(), label: "HSR waiting period expired", actual_date: "2026-02-04" },
          { _key: k(), label: "FTC second request issued", actual_date: "2026-02-15", note: "Baby care, feminine hygiene, OTC overlap" },
          { _key: k(), label: "Substantial compliance (est. 3-6 months)", expected_date: "2026-07-15" },
          { _key: k(), label: "30-day waiting period expires", expected_date: "2026-08-15" },
          { _key: k(), label: "FTC decision / consent decree", expected_date: "2026-09-30" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "EC_Merger",
        outcome: "pending",
        outcome_summary: "Filing planned. Both companies have significant European revenues — EUMR thresholds exceeded. Pre-notification likely underway.",
        steps: [
          { _key: k(), label: "Pre-notification discussions", expected_date: "2026-04-01" },
          { _key: k(), label: "Formal notification", expected_date: "2026-05-15" },
          { _key: k(), label: "Phase I decision (25 working days)", expected_date: "2026-06-26" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "CMA",
        outcome: "pending",
        outcome_summary: "Both companies have UK operations. CMA review expected.",
        steps: [
          { _key: k(), label: "CMA review", expected_date: "2026-06-30", note: "Phase 1: 40 working days" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "NZCC",
        outcome: "conditional",
        outcome_summary: "Part of a coordinated NZ/AU review. Companies proposed to divest all of Kenvue's feminine hygiene business in NZ and AU (Kotex vs Stayfree/Carefree) to address competitive overlap.",
        case_url: "https://comcom.govt.nz/case-register/case-register-entries/kimberly-clark-corporation-and-kenvue-inc",
        steps: [
          { _key: k(), label: "Clearance application filed", actual_date: "2026-02-15" },
          { _key: k(), label: "Divestiture proposal submitted", actual_date: "2026-03-15", note: "Full Kenvue feminine hygiene business in NZ/AU" },
          { _key: k(), label: "Decision", expected_date: "2026-06-15" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "ACCC",
        outcome: "conditional",
        outcome_summary: "Part of a coordinated NZ/AU review. Companies proposed to divest all of Kenvue's feminine hygiene business in NZ and AU (Kotex vs Stayfree/Carefree) to address competitive overlap.",
        steps: [
          { _key: k(), label: "Clearance application filed", actual_date: "2026-02-15" },
          { _key: k(), label: "Divestiture proposal submitted", actual_date: "2026-03-15", note: "Full Kenvue feminine hygiene business in NZ/AU" },
          { _key: k(), label: "Decision", expected_date: "2026-06-15" },
        ],
      },
    ],
    shareholder_votes: [{ party: "target",
      outcome: "approved",
      label: "Both companies — special meetings held January 29, 2026",
      outcome_summary:
        "~96% of KMB shares voted FOR; ~99% of KVUE shares voted FOR. ISS recommended approval. Overwhelming mandate from both shareholder bases.",
      committed_pct: 15,
      committed_notes: "Starboard Value, D.E. Shaw, Toms Capital activist block",
      steps: [
        { _key: k(), label: "Record date", actual_date: "2025-12-11" },
        { _key: k(), label: "Proxy/prospectus effective + mailed", actual_date: "2025-12-16" },
        { _key: k(), label: "ISS recommendation (FOR)", actual_date: "2026-01-15" },
        { _key: k(), label: "Special meetings — both approved", actual_date: "2026-01-29", note: "KMB ~96% FOR, KVUE ~99% FOR" },
      ],
    }],
    ctfn_probability: [
      p("Our 72% probability reflects strong shareholder support (removing vote risk entirely) offset by meaningful FTC second-request uncertainty. The overlaps in baby care (Huggies vs Johnson's Baby), feminine hygiene (Kotex vs Stayfree/Carefree), and potentially OTC health are real — divestitures in at least feminine hygiene are near-certain."),
      p("The NZ/AU divestiture proposal (full Kenvue feminine hygiene business) signals the parties' willingness to offer structural remedies, but the FTC may demand broader divestitures in the US market where concentration is highest. The H2 2026 closing guidance assumes FTC resolution by Q3."),
      p("KMB's April 15 announcement of post-closing organizational structure is a strong confidence signal — companies typically don't publicize integration plans this early unless they expect regulatory clearance."),
    ],
    risk_factors: [
      p("FTC second request: concentrated market share in baby care, feminine hygiene, and OTC health could require significant divestitures."),
      p("Divestiture scope: if FTC demands broader US remedies beyond feminine hygiene, deal economics deteriorate."),
      p("Integration execution: Kenvue has underperformed since J&J spin-off (stock down ~35% from IPO); operational turnaround is essential."),
      p("Leverage: combined entity carries substantially higher debt post-close; $7.7bn bridge facility from JPMorgan."),
      p("Delaware Chancery Court disclosure litigation over JPMorgan's dual role as bridge lender and KMB financial advisor."),
    ],
    shareholder_activism: [
      {
        _key: k(),
        date: "2025-03-15",
        actor: "Starboard Value (Jeffrey Smith)",
        stance: "supportive",
        description:
          "Starboard secured a board seat at Kenvue and pushed for a comprehensive review of strategic alternatives. Starboard described KMB and KVUE as overlapping 'beautifully' and was the catalyst for the deal process.",
      },
      {
        _key: k(),
        date: "2025-10-20",
        actor: "D.E. Shaw (~3% stake)",
        stance: "supportive",
        description:
          "D.E. Shaw built a ~3% position in KVUE during the strategic review, signaling institutional support for a transaction.",
      },
      {
        _key: k(),
        date: "2025-10-25",
        actor: "Toms Capital / Third Point",
        stance: "supportive",
        description:
          "Multiple event-driven and activist funds accumulated positions ahead of the announcement, creating a supportive shareholder base for any deal the board recommended.",
      },
      {
        _key: k(),
        date: "2026-03-10",
        actor: "Delaware Chancery Court plaintiff",
        stance: "critical",
        description:
          "Complaint filed alleging failure to adequately disclose JPMorgan's fees for providing $7.7bn acquisition bridge financing while simultaneously serving as KMB's financial advisor. Routine M&A disclosure litigation — not expected to be deal-blocking.",
      },
    ],
    documents: [
      { _key: k(), title: "Press Release — KMB/KVUE (11/3/25)", url: "https://investors.kenvue.com/financial-news/news-details/2025/Kimberly-Clark-to-Acquire-Kenvue-Creating-a-32-Billion-Global-Health-and-Wellness-Leader/default.aspx" },
      { _key: k(), title: "Agreement and Plan of Merger (8-K)", url: "https://www.sec.gov/Archives/edgar/data/1944048/000110465925105216/tm2529895d1_8k.htm" },
      { _key: k(), title: "Merger Agreement (full text)", url: "https://www.sec.gov/Archives/edgar/data/1944048/000110465925105216/tm2529895d1_ex2-1.htm" },
      { _key: k(), title: "Definitive Merger Proxy (DEFM14A)", url: "https://www.sec.gov/Archives/edgar/data/1944048/000114036125045607/ny20060344x1_defm14a.htm" },
      { _key: k(), title: "Shareholder Vote Results (1/29/26)", url: "https://investors.kenvue.com/financial-news/news-details/2026/Kimberly-Clark-and-Kenvue-Shareholders-Overwhelmingly-Approve-Kimberly-Clarks-Acquisition-of-Kenvue/default.aspx" },
      { _key: k(), title: "KMB Post-Closing Org Structure (4/15/26)", url: "https://www.prnewswire.com/news-releases/kimberly-clark-announces-post-closing-organizational-structure-and-identifies-key-leadership-302742498.html" },
    ],
    trigger_alert: false,
    alert_summary: "KMB announces post-closing organizational structure ahead of regulatory clearance.",
  },

  // 6 ── AES / GIP-led consortium
  {
    acquirer: "Global Infrastructure Partners / EQT / CalPERS / QIA",
    target: "AES Corporation",
    acquirer_ticker: "GIP",
    target_ticker: "AES",
    status: "pre_event",
    sector: "energy",
    target_jurisdiction: "Delaware",
    deck: "AES AGM set for April 29; preliminary proxy filing May 1; primary regulatory filings May 30. Indiana politics and PUCO data center backlash are the key state-level risks.",
    key_risk_summary:
      "Indiana politics (though next legislative session January 2027); PUCO — possible data center backlash; CFIUS to a lesser extent given QIA involvement or EQT given Trump admin backlash vs. Europe.",
    equity_value: 10700,
    shares_outstanding: 713,
    offer_price: 15,
    offer_terms: "$15 per share in cash",
    premium: 35.5,
    premium_reference: "vs AES unaffected close on July 8, prior to media reports of a possible takeover",
    termination_fee: 321,
    termination_fee_pct: 3,
    reverse_termination_fee: 588,
    reverse_termination_fee_pct: 5.5,
    termination_fee_notes:
      "$100mn (1%) additional reverse termination fee if regulators block the deal.",
    financing:
      "The consortium will fund 100% of the acquisition with equity. No debt financing.",
    ctfn_estimated_close: "2027-03-31",
    ctfn_probability_notes:
      "Multiple state utility commissions + CFIUS + FERC create a complex multi-jurisdictional review. All-equity financing removes leverage risk.",
    announcement_date: "2026-03-02",
    published_date: "2026-03-02",
    next_key_event_date: "2026-04-29",
    next_key_event_label: "AES AGM",
    outside_date: "2027-06-01",
    outside_date_final: "2027-12-01",
    outside_date_notes:
      "Subject to two three-month extensions to September 1, 2027 and December 1, 2027.",
    closing_guidance: "Late 2026 or early 2027",
    best_efforts:
      "If needed to get regulatory clearance, the parties shall divest assets and defend the transaction in court.",
    target_advisors:
      "JP Morgan is serving as lead financial advisor, and Wells Fargo is also serving as financial advisor. Skadden, Arps, Slate, Meagher & Flom is serving as lead legal counsel. Davis Polk & Wardwell is serving as legal counsel on certain debt matters.",
    acquirer_advisors:
      "Goldman Sachs is serving as financial advisor to GIP, CalPERS and QIA. Citi is serving as financial advisor to EQT. Kirkland & Ellis is serving as legal counsel to GIP as well as to the broader consortium. Simpson Thacher & Bartlett is serving as legal counsel to EQT.",
    free_preview: [
      p("AES Corporation ($10.7bn equity value) is being taken private by a consortium led by Global Infrastructure Partners (GIP), with EQT, California Public Employees' Retirement System (CalPERS), and Qatar Investment Authority (QIA) as co-investors. The $15 per share all-cash offer represents a 35.5% premium."),
      p("AES has been a takeover target since the summer of 2025. The deal requires approvals from HSR, FERC, PUCO (Ohio), NYPSC (New York), CPUC (California), CEC (California Energy Commission), FCC, CFIUS, and various non-US jurisdictions. The proxy statement shall be filed within 45 business days post-DMA, or by May 1."),
    ],
    background: [
      p("AES has been a takeover target since the summer of 2025. The company operates a diversified portfolio of power generation and utility assets across the US and internationally, with growing exposure to data center power supply."),
      p("The consortium led by Global Infrastructure Partners emerged as the acquirer, with the merger agreement signed and announced on March 2, 2026. GIP, a leading global infrastructure investor, is joined by EQT (European private equity), CalPERS (California state pension fund), and QIA (Qatar sovereign wealth fund)."),
      p("The all-equity financing structure — no debt — is notable for a deal of this size and removes leverage-related closing risk. Dividends continue per ordinary course plus a stub period, with the next quarterly ex-date of May 1 for $0.17595 per share."),
    ],
    commentary: [
      p("AES has been a takeover target since the summer of 2025. The consortium's all-equity structure is unusual for infrastructure take-privates and eliminates financing conditionality risk."),
      p("The multi-jurisdictional regulatory profile is the primary complexity — HSR, FERC, three state utility commissions (PUCO, NYPSC, CPUC), California Energy Commission, FCC, and CFIUS all require approval. State regulatory approvals for utility holding company changes typically take 6-12 months."),
      p("QIA's involvement introduces CFIUS exposure, though the primary CFIUS concern would be around critical infrastructure (power generation / grid assets) rather than data sensitivity. EQT's European origin may also draw scrutiny given current Trump administration posture toward European investors."),
    ],
    filings: [
      {
        _key: k(),
        jurisdiction: "HSR",
        outcome: "pending",
        outcome_summary: "HSR filing expected by May 30.",
        steps: [
          { _key: k(), label: "HSR to be filed", expected_date: "2026-05-30" },
          { _key: k(), label: "Initial waiting period (30 days)", expected_date: "2026-06-29" },
          { _key: k(), label: "Second request (if issued)", note: "Would extend timeline 3-6 months" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "FERC",
        outcome: "pending",
        outcome_summary: "FERC approval required for change of control of power generation assets.",
        steps: [
          { _key: k(), label: "FERC filing", expected_date: "2026-05-30" },
          { _key: k(), label: "FERC approval", expected_date: "2026-12-15", note: "Typical review 6-12 months" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "PUCO",
        outcome: "pending",
        outcome_summary: "Ohio utility commission approval required. Possible data center backlash is a risk factor.",
        steps: [
          { _key: k(), label: "PUCO filing", expected_date: "2026-05-30" },
          { _key: k(), label: "PUCO review + hearings", expected_date: "2027-01-15", note: "State utility reviews typically 6-12 months" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "NYPSC",
        outcome: "pending",
        steps: [
          { _key: k(), label: "NYPSC filing", expected_date: "2026-05-30" },
          { _key: k(), label: "NYPSC approval", expected_date: "2027-01-15" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "CPUC",
        outcome: "pending",
        steps: [
          { _key: k(), label: "CPUC filing", expected_date: "2026-05-30" },
          { _key: k(), label: "CPUC approval", expected_date: "2027-01-15" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "CEC",
        outcome: "pending",
        steps: [
          { _key: k(), label: "CEC filing", expected_date: "2026-05-30" },
          { _key: k(), label: "CEC approval", expected_date: "2027-01-15" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "FCC",
        outcome: "pending",
        steps: [
          { _key: k(), label: "FCC filing", expected_date: "2026-05-30" },
          { _key: k(), label: "FCC approval", expected_date: "2026-12-15" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "CFIUS",
        outcome: "pending",
        outcome_summary: "CFIUS review required given QIA (Qatar sovereign wealth) involvement and AES's critical infrastructure assets (power generation, grid). EQT's European origin may also draw scrutiny.",
        steps: [
          { _key: k(), label: "CFIUS filing deadline", expected_date: "2026-03-27", note: "Filed by March 27 per merger agreement" },
          { _key: k(), label: "CFIUS Phase 1 review (45 days)", expected_date: "2026-05-11" },
          { _key: k(), label: "CFIUS Phase 2 investigation (45 days)", expected_date: "2026-06-25", note: "If required" },
          { _key: k(), label: "CFIUS determination", expected_date: "2026-07-30" },
        ],
      },
    ],
    shareholder_votes: [{ party: "target",
      outcome: "pending",
      label: "Target shareholders — proxy to be filed by May 1",
      outcome_summary:
        "Proxy statement shall be filed within 45 business days post-DMA, or by May 1. AES AGM set for April 29.",
      steps: [
        { _key: k(), label: "AES AGM", expected_date: "2026-04-29" },
        { _key: k(), label: "Preliminary proxy filing", expected_date: "2026-05-01" },
        { _key: k(), label: "Definitive proxy + shareholder vote", expected_date: "2026-07-15", note: "Estimated based on typical proxy timeline" },
      ],
    }],
    ctfn_probability: [
      p("Our 65% probability reflects the multi-jurisdictional complexity — HSR, FERC, three state utility commissions (PUCO, NYPSC, CPUC), California Energy Commission, FCC, and CFIUS. Each jurisdiction reviews independently and on its own timeline. State utility reviews for holding company changes routinely take 6-12 months."),
      p("The all-equity financing removes one major risk variable — no financing condition, no debt commitment expiration. The consortium's willingness to fund 100% with equity signals strong conviction and eliminates the most common cause of deal failure in leveraged infrastructure transactions."),
      p("Indiana political risk is real but delayed — the next legislative session is January 2027. PUCO data center backlash could create friction at the Ohio commission. CFIUS risk is moderate given QIA's involvement and AES's critical infrastructure assets."),
    ],
    risk_factors: [
      p("Multi-jurisdictional regulatory complexity: 8+ separate approvals required, each on independent timelines."),
      p("Indiana politics — next legislative session January 2027 could create retroactive obstacles."),
      p("PUCO data center backlash — Ohio commission may impose conditions on data center power supply operations."),
      p("CFIUS: QIA sovereign wealth + EQT European origin + critical infrastructure assets = meaningful review."),
      p("Extended timeline risk: state utility reviews routinely take 6-12 months; outside date extensions may be needed."),
    ],
    shareholder_activism: [
      {
        _key: k(),
        date: "2026-03-24",
        actor: "Indiana lawmakers",
        stance: "critical",
        description:
          "Indiana Utility Regulatory Commission investigation raised concerns after lawmakers questioned the impact of the takeover on Indiana ratepayers and the state's energy infrastructure.",
        source_url: "https://www.wfyi.org/news/articles/indiana-utility-regulatory-commission-investigation-after-lawmakers-raise-concerns-residents-bills",
      },
    ],
    documents: [
      { _key: k(), title: "Press Release (3/2/26)", url: "https://www.prnewswire.com/news-releases/consortium-led-by-global-infrastructure-partners-and-eqt-agrees-to-acquire-aes-302700916.html" },
      { _key: k(), title: "Definitive Merger Agreement", url: "https://www.sec.gov/Archives/edgar/data/874761/000119312526084157/d100078dex21.htm" },
    ],
    trigger_alert: false,
    alert_summary: "AES AGM set for April 29; regulatory filings due May 30.",
  },

  // 7 ── AXTA / AKZA — coatings merger of equals
  {
    acquirer: "AkzoNobel",
    target: "Axalta Coating Systems",
    target_ticker: "AXTA",
    acquirer_ticker: "AKZA:NA",
    status: "ongoing",
    sector: "industrials",
    target_jurisdiction: "Bermuda",
    deck: "CMA comment period ends May 1; EC formal filing pending (Phase 2 probe likely on powder coatings). Shareholder votes targeted for mid-July. All-stock merger of equals creating #2 global coatings company behind Sherwin-Williams.",
    key_risk_summary:
      "EC may require divestitures in Europe as the merging parties may control up to 50% of the powder coating market, as well as a significant portion of the vehicle refinish market. The potential divestiture process will likely have a significant impact on timing.",
    equity_value: 9100,
    shares_outstanding: 213,
    offer_price: 36.63,
    offer_terms: "0.6539 AkzoNobel shares per Axalta share (implying €36.63/share)",
    premium: 0,
    premium_reference: "nil — structured as merger of equals",
    termination_fee: 150,
    termination_fee_pct: 2,
    reverse_termination_fee: 150,
    reverse_termination_fee_pct: 2,
    termination_fee_notes:
      "€150mn reciprocal (2%). All-stock consideration — no cash component to Axalta shareholders.",
    financing:
      "AkzoNobel will pay a special cash dividend to its own shareholders equal to €2.5bn minus aggregate regular dividends paid in 2026 before closing. Funded via: senior unsecured notes (EMTN programme), commercial paper ($3bn + €1.5bn programmes), ~€900mn net proceeds from completed AkzoNobel India sale to JSW Group, and €1.5bn multi-currency revolving credit facility (includes $750mn swingline, runs to March 2031). Bridge loan facility available if needed.",
    ctfn_estimated_close: "2026-12-31",
    ctfn_probability_notes:
      "EC Phase 2 probe widely expected on powder coatings (up to 50% combined share). CMA just opened investigation. Shareholder opposition from Artisan Partners + Shapiro Capital (~1.8% of AXTA) is vocal but not blocking-scale.",
    announcement_date: "2025-11-18",
    published_date: "2025-11-19",
    next_key_event_date: "2026-05-01",
    next_key_event_label: "CMA comment period ends; EC formal filing",
    outside_date: "2027-05-18",
    outside_date_final: "2027-11-18",
    outside_date_notes:
      "Subject to extension to November 18, 2027 if regulatory approvals remain pending.",
    closing_guidance: "Late 2026 to early 2027",
    best_efforts:
      "If needed to get regulatory clearance, the parties shall divest assets and defend the transaction in court.",
    target_advisors:
      "Evercore and JP Morgan (co-lead financial). Incentrum Group also providing financial advice. Cravath, Swaine & Moore and NautaDutilh (legal). Walkers Global (Bermuda law). Joele Frank, Wilkinson Brimmer Katcher (PR).",
    acquirer_advisors:
      "Morgan Stanley (financial). De Brauw Blackstone Westbroek and Davis Polk & Wardwell (legal). FGS Global (PR). Lazard and Wakkie+Perrick serving as financial and legal advisors, respectively, to the supervisory board of AkzoNobel.",
    free_preview: [
      p("Axalta Coating Systems and AkzoNobel are combining in an all-stock merger of equals to create a premier global coatings company with ~$17bn in annual revenue and a combined enterprise value of ~$25bn. The combined company will be the second largest coatings company by revenue behind Sherwin-Williams."),
      p("Axalta shareholders will receive 0.6539 AkzoNobel shares per share. AkzoNobel shareholders will own ~55% and Axalta shareholders ~45% of the combined company. The deal faces significant regulatory scrutiny — EC may require divestitures given up to 50% combined share in powder coatings and substantial overlap in vehicle refinish."),
    ],
    background: [
      p("In 2017, PPG Industries and AkzoNobel both engaged with Axalta regarding a merger, though no deal was announced as the companies were unable to agree on terms."),
      p("AES has been a takeover target since the summer of 2025. The merger of equals structure was announced November 18, 2025. The nil-premium, all-stock structure positions this as a strategic combination rather than a premium acquisition."),
      p("AkzoNobel completed the sale of 60.76% of AkzoNobel India to JSW Group on December 10, 2025, generating ~€900mn in net proceeds. AkzoNobel's India Powder Coatings business and International Research Center were retained."),
      p("AkzoNobel CFO Maarten de Vries, scheduled to retire in April 2026, extended his tenure by one year to support merger execution. Axalta CFO Carl Anderson will take the combined company CFO role at close."),
    ],
    commentary: [
      p("AkzoNobel will pay a special cash dividend to its own shareholders equal to €2.5bn minus aggregate regular/interim dividends paid in 2026 before closing. This is an AkzoNobel shareholder benefit and does not accrue to Axalta shareholders."),
      p("The transaction targets $600mn in annual run-rate cost synergies, with 90% expected within three years. Primary drivers: procurement savings, SG&A efficiencies, manufacturing footprint optimization, and supply chain management. Combined annual R&D spend of ~$400mn with over 4,000 scientists."),
      p("Axalta operates in Performance Coatings (65.5% of sales — refinish and industrial end-markets) and Mobility Coatings (34.5% — light vehicle and commercial vehicle OEMs). Key brands: Cromax, Standox, AquaEC, Imron."),
      p("AkzoNobel serves industrial and consumer markets via Decorative Paints (Dulux, Sikkens) and Performance Coatings (automotive refinish, aerospace, marine, protective, powder, industrial). Present in 150+ countries."),
      p("Significant overlaps in Automotive Refinish and Industrial Coatings end-markets. Both are world leaders in coatings for vehicle repair (refinish) and industrial applications like metal and powder coatings. Also notable overlap in Mobility/Transportation portfolios — both provide high-tech coatings to light vehicles, commercial vehicles, and aerospace."),
    ],
    filings: [
      {
        _key: k(),
        jurisdiction: "HSR",
        outcome: "pending",
        outcome_summary: "Subject to HSR clearance. Filing targeted by end of February 2026. No second request publicly reported.",
        steps: [
          { _key: k(), label: "HSR filing", expected_date: "2026-02-28", note: "CEO indicated all main filings by ~Feb 10" },
          { _key: k(), label: "HSR clearance / second request", expected_date: "2026-05-30" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "EC_Merger",
        outcome: "pending",
        outcome_summary: "Parties in pre-notification with EC. Preliminary filing submitted, awaiting feedback. Capitol Forum reports an in-depth Phase 2 probe is likely given up to 50% combined powder coatings share. No remedy discussions at this stage as of April 9.",
        steps: [
          { _key: k(), label: "Preliminary filing submitted", actual_date: "2026-02-10" },
          { _key: k(), label: "Awaiting EC feedback on preliminary filing", actual_date: "2026-03-20" },
          { _key: k(), label: "Formal notification (Form CO)", expected_date: "2026-05-15" },
          { _key: k(), label: "Phase I decision (25 working days)", expected_date: "2026-06-26" },
          { _key: k(), label: "Phase II (if opened — likely)", note: "90 working days + 15 if remedies. Would push to late 2026 / early 2027." },
        ],
      },
      {
        _key: k(),
        jurisdiction: "CMA",
        outcome: "pending",
        outcome_summary: "Draft merger notice filed. CMA opened formal investigation April 16 and invited comment until May 1. Phase 1 expected to begin after comment period. Case officers: Anushka Singh, Raphael Cannell, Manisha Juttla.",
        case_url: "https://www.gov.uk/cma-cases/akzonobel-slash-axalta-merger-inquiry",
        steps: [
          { _key: k(), label: "Draft merger notice filed", actual_date: "2026-04-01" },
          { _key: k(), label: "CMA opened investigation + invitation to comment", actual_date: "2026-04-16" },
          { _key: k(), label: "Comment period closes", expected_date: "2026-05-01" },
          { _key: k(), label: "Phase 1 formal launch", expected_date: "2026-05-10", note: "Expected shortly after comment period" },
          { _key: k(), label: "Phase 1 decision (40 working days)", expected_date: "2026-07-07" },
          { _key: k(), label: "Phase 2 (if referred)", note: "Up to 24 weeks" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "Other",
        display_name: "Other antitrust + FDI (~30 jurisdictions)",
        outcome: "pending",
        outcome_summary: "Various non-US requirements to be filed by May 30. Approximately 30 jurisdictions require clearance. AkzoNobel's works council consultation (required under Dutch law) is a separate closing condition.",
        steps: [
          { _key: k(), label: "Major jurisdiction filings completed", expected_date: "2026-02-28" },
          { _key: k(), label: "Remaining filings by May 30", expected_date: "2026-05-30" },
          { _key: k(), label: "Works council consultation (Dutch law)", note: "Must be completed before closing" },
        ],
      },
    ],
    shareholder_votes: [{ party: "target",
      outcome: "pending",
      label: "Both target and acquirer — majority of votes cast required",
      outcome_summary:
        "Both Axalta and AkzoNobel shareholders must approve. Proxy statement to be filed within 45 business days post-DMA or by May 1. Votes targeted for mid-July 2026. Artisan Partners (~0.7%) and Shapiro Capital (~1.1%) have publicly opposed the deal, representing ~1.8% of Axalta shares.",
      steps: [
        { _key: k(), label: "Proxy statement filing deadline", expected_date: "2026-05-01" },
        { _key: k(), label: "Definitive proxy mailed", expected_date: "2026-06-01" },
        { _key: k(), label: "Shareholder votes (both companies)", expected_date: "2026-07-15", note: "Mid-July target per management" },
      ],
    }],
    ctfn_probability: [
      p("Our 62% probability reflects the near-certainty of an EC Phase 2 investigation on powder coatings (combined share up to 50%) and significant vehicle refinish overlap. The CMA investigation launched today (April 16) adds a second competition authority with independent remedies jurisdiction."),
      p("The nil-premium, all-stock structure creates a shareholder opposition dynamic unusual for deals of this size — Artisan Partners called it a 'selling out' of a well-performing company for the currency of one with 'inferior assets and a track record of value stagnation.' While Artisan + Shapiro together hold only ~1.8% of Axalta, their public stance could embolden other passive holders."),
      p("Precedent transactions provide mixed guidance. Sherwin-Williams' $11bn acquisition of Valspar (2017) required FTC-mandated divestiture of Valspar's North American industrial wood coatings. AkzoNobel's own acquisition of BASF's industrial coatings saw an in-depth EC review with clearance subject to competition remaining. The SigmaKalon/PPG acquisition (2007) was cleared after the EC found significant competition in automotive refinish coatings (20-30% combined share in France and several other segments)."),
    ],
    risk_factors: [
      p("EC Phase 2 probe on powder coatings overlap (up to 50% combined share) — widely expected by analysts (Capitol Forum, January 2026)."),
      p("Vehicle refinish overlap: both companies are global leaders in coatings for vehicle repair (body shops). Divestitures likely required in multiple geographies."),
      p("CMA Phase 2 referral risk: UK investigation just opened; combined powder coatings share may trigger Phase 2."),
      p("Shareholder opposition: Artisan Partners (~0.7%) and Shapiro Capital (~1.1%) publicly oppose the deal — combined ~1.8% of Axalta. Could embolden broader vote resistance given nil premium."),
      p("~30 jurisdictions require clearance — coordination across regulators adds timeline complexity."),
      p("AkzoNobel special dividend (€2.5bn) reduces combined balance sheet flexibility if divestitures reduce expected synergies."),
    ],
    shareholder_activism: [
      {
        _key: k(),
        date: "2025-11-19",
        actor: "Artisan Partners (~0.7% of Axalta)",
        stance: "opposed",
        description:
          "Artisan Partners, holding 1.4mn shares, spoke out against the proposed all-stock merger of equals. It called the transaction a 'selling out' of a well-performing, undervalued Axalta for the currency of AkzoNobel, a company it criticized for having inferior assets and a track record of value stagnation. Artisan urged other shareholders to vote against the deal and invited alternative buyers offering more money.",
      },
      {
        _key: k(),
        date: "2025-12-05",
        actor: "Shapiro Capital Management (~1.1% of Axalta)",
        stance: "opposed",
        description:
          "President Louis Shapiro stated Axalta investors 'should get the premium they deserve' and signaled a vote against unless terms improve. This was a notable escalation of opposition beyond Artisan alone.",
      },
      {
        _key: k(),
        date: "2025-11-20",
        actor: "Cevian Capital (~5% of AkzoNobel)",
        stance: "supportive",
        description:
          "Cevian Capital, one of AkzoNobel's largest shareholders, publicly supports the merger. Cevian's backing is significant given they hold ~5% and their support reduces the risk of AkzoNobel shareholder opposition.",
      },
    ],
    documents: [
      { _key: k(), title: "Press Release (11/18/25)", url: "https://ir.axalta.com/news/press-releases/detail/671/akzonobel-and-axalta-to-combine-in-all-stock-merger-of-equals-creating-a-premier-global-coatings-company" },
      { _key: k(), title: "8-K Filing (Axalta)", url: "https://www.sec.gov/Archives/edgar/data/1616862/000119312525285351/d45746d8k.htm" },
      { _key: k(), title: "Form 425 — Merger Communications", url: "https://www.sec.gov/Archives/edgar/data/1616862/000119312525331065/d82454d425.htm" },
      { _key: k(), title: "CMA Merger Inquiry Case Page", url: "https://www.gov.uk/cma-cases/akzonobel-slash-axalta-merger-inquiry" },
      { _key: k(), title: "Artisan Partners Statement on Axalta (11/19/25)", url: "https://www.globenewswire.com/news-release/2025/11/19/3191522/0/en/Artisan-Partners-Global-Value-Releases-Statement-on-Axalta.html" },
    ],
    trigger_alert: false,
    alert_summary: "CMA opens formal investigation; EC formal filing expected May.",
  },

  // 8 ── TXNM / BX — New Mexico utility take-private
  {
    acquirer: "Blackstone",
    target: "TXNM Energy",
    acquirer_ticker: "BX",
    target_ticker: "TXNM",
    status: "ongoing",
    sector: "energy",
    target_jurisdiction: "New Mexico",
    deck: "NMPRC hearing examiner investigation into Blackstone's $400mn PIPE paused the procedural schedule. Public hearing on PIPE set for April 30. PUCT approved February 6; FERC authorized February 20.",
    key_risk_summary:
      "New Mexico PRC hearing examiners opened an investigation into Blackstone's $400mn PIPE purchase of TXNM shares, alleging it illegally bypassed state approval. The procedural schedule has been paused. NM AG Raúl Torrez and a local nonprofit are also challenging the PIPE transaction.",
    equity_value: 5700,
    shares_outstanding: 93,
    offer_price: 61.25,
    offer_terms: "$61.25 per share in cash",
    premium: 28,
    premium_reference: "vs TXNM unaffected close on March 10, prior to media reports of a possible deal",
    termination_fee: 210,
    termination_fee_pct: 3.7,
    reverse_termination_fee: 350,
    reverse_termination_fee_pct: 6.1,
    termination_fee_notes:
      "$100mn (1%) additional if regulators block the deal.",
    financing:
      "The transaction is funded through equity and assumption of existing debt. Blackstone is also investing $400mn through a purchase of 8mn newly issued TXNM shares at $50 per share via private placement (PIPE). The $400mn PIPE closed on June 2, 2025.",
    ctfn_estimated_close: "2026-09-30",
    ctfn_probability_notes:
      "CTFN enforceability rating: STRONG (favors seller). PUCT and FERC cleared. NMPRC is the primary remaining risk — PIPE investigation + AG challenge create procedural uncertainty.",
    announcement_date: "2025-05-19",
    published_date: "2025-05-20",
    next_key_event_date: "2026-04-30",
    next_key_event_label: "NMPRC public hearing on PIPE",
    outside_date: "2026-08-18",
    outside_date_final: "2026-12-31",
    outside_date_notes:
      "Subject to an automatic extension to December 31, 2026.",
    closing_guidance: "H2 2026",
    best_efforts:
      "If necessary, the parties shall divest assets and defend the transaction through litigation.",
    target_advisors:
      "Wells Fargo is serving as lead financial advisor. Citi is also serving as a financial advisor. Troutman Pepper Locke is serving as legal counsel.",
    acquirer_advisors:
      "RBC is serving as lead financial advisor. JP Morgan is also serving as a financial advisor. Kirkland & Ellis is serving as legal counsel.",
    free_preview: [
      p("Blackstone Infrastructure is acquiring TXNM Energy (formerly PNM Resources) for $61.25 per share in cash, implying a $5.7bn equity value. The 28% premium is measured against the unaffected close on March 10, 2025, prior to media reports of a possible deal."),
      p("The Texas Public Utility Commission (PUCT) approved on February 6, 2026. FERC authorized on February 20. The New Mexico Public Regulation Commission (NMPRC) remains the primary regulatory hurdle — hearing examiners opened an investigation into Blackstone's $400mn PIPE purchase and paused the procedural schedule."),
    ],
    background: [
      p("TXNM (then trading as PNM Resources) entered into a merger agreement with Avangrid in October 2020, which Avangrid terminated in January 2024 after regulatory pushback from the NMPRC. Following this, TXNM's board renamed the company and resumed a strategic review."),
      p("Between January 9 and January 29, 2025, TXNM executed NDAs with Blackstone Infrastructure, Party A, Party B, Party C and Party D, providing dataroom access and requesting bids by February 18."),
      p("On February 18, Blackstone, Party A, and Party D submitted initial bids for $58, $60.25 and $55 per share, respectively. Party B and Party C did not participate. All three bidders offered interim financing via a $400mn PIPE. Party D declined to increase its bid and was dropped on February 21. TXNM's board chose to advance with Blackstone and Party A."),
      p("On February 28, Party E submitted an unsolicited $60-per-share offer with a direct equity investment and sought exclusivity. After preliminary talks, TXNM sent an NDA to Party E on March 7, which was executed on March 12. Dataroom access was granted the same day."),
      p("On March 10 and March 11, news reports revealed TXNM was exploring a sale, pushing the company's stock price from $47.87 to $51.18. Despite inbound enquiries from strategic and financial investors after these reports, TXNM concluded on March 19 that none were actionable or competitive and that the process should stay focused on the existing bidders."),
      p("On March 28, Party E indicated it would be unable to meet the April 14 deadline. On April 4, Party A also signaled it could not submit a bid by the deadline, citing regulatory concerns, which it confirmed again on April 10 after its largest passive equity backer dropped out. TXNM explored potential consortium options involving Party E, but neither Party A nor Blackstone engaged further with Party E."),
      p("On April 14, Blackstone submitted a second-round bid at $61 per share and a PIPE purchase price of $48.50. On April 18, Blackstone increased its bid to $61.25 per share and the PIPE price to $50 per share, in addition to a $350mn termination fee for regulatory failure or breach. From April 24 to early May, TXNM and Blackstone negotiated final terms."),
      p("On May 16, TXNM's board reviewed the merger documents, financing plans and Wells Fargo's fairness analysis. Having considered the $61.25 offer, at a 22.5% premium to the target's 30-day VWAP of $49.78 as of March 5, it found it provided value and certainty to shareholders."),
      p("On May 18, the board unanimously approved the transaction. Wells Fargo delivered its final fairness opinion, and TXNM and Blackstone executed the merger agreement, PIPE agreement and financing documents. Blackstone also delivered commitment letters on the same day. On May 19, the parties announced the transaction. On June 2, the $400mn PIPE closed, with TXNM issuing stock to an affiliate of Blackstone Infrastructure."),
    ],
    commentary: [
      p("TXNM dividends will continue through closing of the transaction. Blackstone is also investing $400mn through a purchase of 8mn newly issued TXNM shares at $50 per share by way of a private-placement agreement."),
      p("On February 19, New Mexico attorney general Raúl Torrez and a local nonprofit challenged the $400mn stock sale from TXNM Energy to Blackstone, alleging it illegally bypassed state approval."),
      p("On March 11, the NMPRC hearing examiners opened an investigation into Blackstone's $400mn PIPE purchase and paused the procedural schedule for the merger case. A public hearing on the PIPE matter is scheduled for April 30."),
    ],
    filings: [
      {
        _key: k(),
        jurisdiction: "HSR",
        outcome: "cleared",
        outcome_summary: "HSR approval and clearance received.",
        steps: [
          { _key: k(), label: "HSR clearance received", actual_date: "2025-09-15" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "FCC",
        outcome: "cleared",
        outcome_summary: "FCC clearance received.",
        steps: [
          { _key: k(), label: "FCC clearance", actual_date: "2025-09-15" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "FERC",
        outcome: "cleared",
        outcome_summary: "FERC Section 203 authorization granted February 20, 2026 — docket EC25-140-000.",
        case_url: "https://www.prnewswire.com/news-releases/ferc-authorizes-txnm-energy-acquisition-by-blackstone-infrastructure-finds-transaction-consistent-with-public-interest-302693942.html",
        steps: [
          { _key: k(), label: "FERC authorized", actual_date: "2026-02-20" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "PUCT",
        outcome: "cleared",
        outcome_summary: "180-day review period. PUCT approved the transaction.",
        case_url: "https://tnmp.com/about-us/news-media/texas-approves-txnm-energys-acquisition-blackstone-infrastructure",
        steps: [
          { _key: k(), label: "Application filed", actual_date: "2025-08-25" },
          { _key: k(), label: "PUCT approved", actual_date: "2026-02-06" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "NMPRC",
        outcome: "conditional",
        outcome_summary: "Primary remaining regulatory risk. Application filed August 25, 2025 (case 25-00060-UT). Hearing examiners opened investigation into the $400mn PIPE on March 11 and paused the procedural schedule. NM AG Raúl Torrez challenging the PIPE. Public hearing on PIPE set for April 30.",
        case_url: "https://www.prc.nm.gov/pnm_acquisition_case_information/",
        steps: [
          { _key: k(), label: "Application filed", actual_date: "2025-08-25" },
          { _key: k(), label: "Intervention deadline", actual_date: "2025-12-05" },
          { _key: k(), label: "Staff/Intervenor direct testimony", actual_date: "2026-03-06" },
          { _key: k(), label: "PIPE investigation opened + schedule paused", actual_date: "2026-03-11" },
          { _key: k(), label: "Stipulation deadline", actual_date: "2026-03-20" },
          { _key: k(), label: "Rebuttal testimony", actual_date: "2026-04-03" },
          { _key: k(), label: "Prehearing conference", actual_date: "2026-04-28" },
          { _key: k(), label: "Public hearing on PIPE", expected_date: "2026-04-30" },
          { _key: k(), label: "Revised procedural schedule hearing", expected_date: "2026-05-06", note: "Parties to meet via video link" },
          { _key: k(), label: "Merger hearing (May 4-15)", expected_date: "2026-05-04", note: "If schedule resumes" },
          { _key: k(), label: "NMPRC decision", expected_date: "2026-08-15", note: "Estimated — no statutory deadline" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "NRC",
        outcome: "pending",
        outcome_summary: "Approval required for transfer of nuclear facility licenses.",
        steps: [
          { _key: k(), label: "NRC approval", expected_date: "2026-06-30" },
        ],
      },
    ],
    shareholder_votes: [{ party: "target",
      outcome: "approved",
      label: "Target shareholders — approved August 28, 2025",
      steps: [
        { _key: k(), label: "Definitive proxy filed", actual_date: "2025-07-17" },
        { _key: k(), label: "Shareholder vote — approved", actual_date: "2025-08-28" },
      ],
    }],
    ctfn_probability: [
      p("Our 70% probability reflects CTFN's STRONG enforceability rating (favors seller) offset by the NMPRC's unpredictable procedural posture. The PIPE investigation is a novel complication — hearing examiners pausing the merger schedule over a pre-closing equity investment is unusual and creates timeline risk."),
      p("PUCT and FERC cleared without conditions. The NMPRC is the sole remaining US gating authority. New Mexico's regulatory history with this asset is difficult — the prior Avangrid merger was terminated after years of NMPRC opposition. Blackstone's approach (equity-funded, no leverage) is designed to address the commission's historic concerns about financial buyers."),
      p("The NM AG's challenge to the PIPE adds political dimension. If the AG succeeds in unwinding the PIPE, it doesn't necessarily kill the merger — but it signals the political environment Blackstone faces at the NMPRC."),
    ],
    risk_factors: [
      p("NMPRC PIPE investigation: hearing examiners paused the merger procedural schedule to investigate the $400mn private placement, alleging it may have bypassed state approval."),
      p("NM AG Raúl Torrez challenging the PIPE transaction — political risk layered on top of regulatory risk."),
      p("New Mexico regulatory history: prior Avangrid merger was terminated in January 2024 after years of NMPRC pushback."),
      p("NRC approval required for nuclear facility license transfers — secondary timeline risk."),
      p("Outside date August 18, 2026 with extension to December 31 — tight if NMPRC hearing schedule slips."),
    ],
    shareholder_activism: [
      {
        _key: k(),
        date: "2025-11-19",
        actor: "NM Attorney General Raúl Torrez",
        stance: "opposed",
        description:
          "AG Torrez published an op-ed opposing the transaction and raising concerns about private equity ownership of a regulated utility. Subsequently, on February 19, 2026, Torrez and a local nonprofit formally challenged the $400mn PIPE stock sale, alleging it illegally bypassed state regulatory approval.",
        source_url: "https://www.sec.gov/",
      },
      {
        _key: k(),
        date: "2026-03-11",
        actor: "NMPRC Hearing Examiners",
        stance: "critical",
        description:
          "Hearing examiners opened a formal investigation into Blackstone's $400mn PIPE purchase of TXNM shares and paused the merger procedural schedule pending resolution. A public hearing on the PIPE matter is set for April 30.",
      },
    ],
    documents: [
      { _key: k(), title: "Press Release (5/19/25)", url: "https://www.sec.gov/Archives/edgar/data/22767/000110842625000048/pnm-20250519.htm" },
      { _key: k(), title: "Investor Presentation", url: "https://www.txnmenergy.com/~/media/Files/P/PNM-Resources/events-and-presentations/2025/Acquisition%20Investor%20Presentation%20May%2019.pdf" },
      { _key: k(), title: "Definitive Proxy (DEFM14A)", url: "https://www.sec.gov/Archives/edgar/data/1108426/000114036125026615/ny20050483x2_defm14a.htm" },
    ],
    trigger_alert: false,
    alert_summary: "NMPRC public hearing on PIPE set for April 30; merger hearing schedule under review.",
  },

  // 9 ── QRVO / SWKS — semiconductor merger
  {
    acquirer: "Skyworks Solutions",
    target: "Qorvo",
    acquirer_ticker: "SWKS",
    target_ticker: "QRVO",
    status: "ongoing",
    sector: "technology",
    target_jurisdiction: "Delaware",
    deck: "Negotiating with primary regulators in the US (FTC) and China (SAMR). FTC second request received February 5. Merger agreement runs two years. Starboard Value (8% of QRVO) signed a voting agreement in support.",
    key_risk_summary:
      "China's SAMR is known for slow-walking US-based technology mergers, specifically in the semiconductor industry which this deal falls in. The FTC second request also heavily impacts timing of the deal, though the merger agreement runs two years in length.",
    equity_value: 9730,
    shares_outstanding: 92,
    offer_price: 32.50,
    offer_terms: "$32.50 in cash and 0.960 of a Skyworks common share for each Qorvo share held",
    premium: 14.3,
    premium_reference: "vs QRVO closing price on October 27",
    termination_fee: 298.7,
    termination_fee_pct: 3.1,
    reverse_termination_fee: 298.7,
    reverse_termination_fee_pct: 3.1,
    termination_fee_notes:
      "$100mn (1%) additional in the event of a failure to get required regulatory clearances or an injunction related to antitrust laws.",
    financing:
      "Skyworks has secured a $3.05bn debt commitment from Goldman Sachs via senior unsecured bridge loans to finance a portion of the merger's cash consideration and related fees. The receipt of this financing is not a condition for Skyworks' obligation to complete the merger.",
    ctfn_estimated_close: "2027-01-15",
    ctfn_probability_notes:
      "FTC second request + SAMR slow-walk risk on semiconductor mergers. Two-year merger agreement provides runway. Starboard voting agreement supportive.",
    announcement_date: "2025-10-28",
    published_date: "2025-10-28",
    next_key_event_date: "2026-06-15",
    next_key_event_label: "FTC substantial compliance target",
    outside_date: "2027-04-27",
    outside_date_final: "2027-10-27",
    outside_date_notes:
      "Subject to two additional extensions to July 27, 2027, and to October 27, 2027.",
    closing_guidance: "Early 2027",
    best_efforts:
      "If necessary to get regulatory clearance, the parties shall defend the transaction in court and divest any asset with revenues under $100mn, and any combination of assets with total revenues under $250mn.",
    target_advisors:
      "Centerview Partners is serving as financial advisor. Davis Polk & Wardwell is serving as legal counsel. Joele Frank, Wilkinson Brimmer Katcher is running PR.",
    acquirer_advisors:
      "Qatalyst Partners and Goldman Sachs are serving as financial advisors. Skadden, Arps, Slate, Meagher & Flom is serving as legal counsel. FGS Global is running PR.",
    free_preview: [
      p("Skyworks Solutions is acquiring Qorvo in a cash-and-stock transaction valued at $9.73bn. Qorvo shareholders will receive $32.50 in cash and 0.960 of a Skyworks common share for each Qorvo share held. The combination creates a $22bn US-based leader in high-performance RF and analog solutions."),
      p("The deal faces scrutiny from the FTC (second request received February 5, 2026) and China's SAMR, which is known for slow-walking US semiconductor mergers. The merger agreement runs for two years, providing significant regulatory runway. Starboard Value, an 8% shareholder of Qorvo, has signed a voting agreement in support."),
    ],
    background: [
      p("In 2015, the merger of RF Micro Devices (RFMD) and TriQuint Semiconductor created Qorvo. This transaction was a 'merger of equals' intended to consolidate two significant RF players to better compete with larger rivals like Broadcom and Skyworks. That transaction was approved following standard HSR review without significant divestitures, though the current regulatory environment for semiconductor consolidation is notably more stringent."),
      p("In 2021, Skyworks completed the $2.75bn acquisition of Silicon Labs' Infrastructure and Automotive business. This transaction was focused on diversifying Skyworks' revenue away from mobile toward high-growth markets like automotive and power. The deal received regulatory clearance relatively smoothly as it was seen as complementary rather than a direct consolidation of the mobile RF market."),
    ],
    commentary: [
      p("Skyworks shareholders will own 63% of the combined company, while Qorvo shareholders will own 37%, on a fully diluted basis. Starboard Value, an 8% shareholder of Qorvo, has signed a voting agreement in support of the transaction."),
    ],
    ctfn_target_company: [
      p("Qorvo is a global leader in the development and commercialization of technologies and products for the wireless, wired, and power markets. The company operates in three reportable segments: Advanced Cellular Group (ACG), which provides radio frequency (RF) solutions for smartphones, wearables, and laptops; Connectivity and Sensors Group (CSG), which focuses on Wi-Fi, Ultra-Wideband (UWB), and Bluetooth Low Energy (BLE) for the Internet of Things (IoT); and High Performance Analog (HPA), which supplies power management and RF solutions for defense, aerospace, and infrastructure. Key use cases include high-power phased array radar for electronic military applications, low Earth orbit (LEO) satellite communications, and 5G cellular base stations. In the consumer space, Qorvo's solutions enable Wi-Fi 7 connectivity and Matter-compatible smart home devices, while its UWB technology is used for precision location services like digital car keys."),
    ],
    ctfn_acquirer_company: [
      p("Skyworks is a leading provider of analog and mixed-signal semiconductors that empower the wireless networking revolution. The company targets high-growth verticals including electric and hybrid vehicles, industrial motor control, 5G wireless infrastructure, and data centers. Its product portfolio includes power amplifiers, front-end modules, and precision timing chips. A critical use case for Skyworks is its Sky5 platform, which provides integrated 'modem-to-antenna' solutions for 5G smartphones to manage complex frequency bands while optimizing battery life. In the automotive sector, Skyworks provides digital isolators that act as safety barriers in high-voltage EV battery systems and V2X (Vehicle-to-Everything) modules that allow cars to communicate with surrounding infrastructure. Its timing solutions are also used in AI data centers to synchronize massive arrays of GPUs."),
    ],
    ctfn_overlaps: [
      p("There is significant overlap in the RF front-end (RFFE) market, particularly for smartphones and mobile devices. Both companies supply power amplifiers, switches, and integrated front-end modules to the same Tier-1 mobile OEMs (Apple and Samsung). Additionally, they both have substantial business segments focused on wireless infrastructure (5G), defense & aerospace, and IoT connectivity solutions (Wi-Fi, Bluetooth). Both companies also maintain internal fabrication facilities for GaAs (Gallium Arsenide) and filter technologies."),
    ],
    ctfn_rationale_synergies: [
      p("The combination aims to create a $22bn US-based leader in high-performance RF and analog solutions. The primary rationale is to provide a more comprehensive, end-to-end product portfolio for the complex 5G, 6G, and AI-driven connectivity era. By combining Skyworks' expertise in highly integrated modules with Qorvo's strength in high-performance filter technology and HPA, the merged entity expects to accelerate innovation. The transaction is expected to generate $450mn in annual pre-tax cost synergies by year three and be significantly accretive to non-GAAP EPS in the first full year post-closing."),
    ],
    ctfn_competition: [
      p("For Qorvo, the HPA business competes primarily with Analog Devices, MACOM Technology Solutions Holdings, Monolithic Power Systems, NXP Semiconductors, Scientific Components, Silergy, and Texas Instruments. CSG competes primarily with Broadcom, Murata Manufacturing, Nordic Semiconductor, NXP Semiconductors, Qualcomm Technologies, RichWave Technology, Silicon Laboratories, Skyworks Solutions, and Vanchip (Tianjin) Technology. ACG competes primarily with Broadcom, Maxscend Microelectronics, Murata Manufacturing, Qualcomm Technologies, Skyworks Solutions, and Vanchip (Tianjin) Technology."),
      p("For Skyworks, the company competes with the likes of Analog Devices, Broadcom, Cirrus Logic, Murata Manufacturing, NXP Semiconductors, Qorvo, Qualcomm, and Texas Instruments."),
    ],
    ctfn_customers: [
      p("In fiscal year 2025, Apple accounted for approximately 69% of Skyworks' total net revenue. This is a slight increase from 66% in 2024 and 64% in 2023. For Qorvo, in the 2025 fiscal year, Apple accounted for 46% of Qorvo's total revenue (consistent with 46% in 2024 and up from 37% in 2023). Samsung accounted for 10% of total revenue in fiscal 2025, down slightly from 12% in 2024."),
    ],
    filings: [
      {
        _key: k(),
        jurisdiction: "HSR",
        outcome: "conditional",
        outcome_summary: "HSR waiting period was scheduled to expire January 5, 2026. Skyworks withdrew and refiled on January 7. FTC issued a second request on February 5, 2026.",
        steps: [
          { _key: k(), label: "HSR filed", actual_date: "2025-12-03" },
          { _key: k(), label: "HSR expiration scheduled", actual_date: "2026-01-05" },
          { _key: k(), label: "Skyworks withdrew and refiled", actual_date: "2026-01-07" },
          { _key: k(), label: "FTC second request issued", actual_date: "2026-02-05" },
          { _key: k(), label: "Substantial compliance (est. 3-6 months)", expected_date: "2026-06-15" },
          { _key: k(), label: "30-day waiting period expires", expected_date: "2026-07-15" },
          { _key: k(), label: "FTC decision", expected_date: "2026-09-30" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "SAMR",
        outcome: "pending",
        outcome_summary: "China's SAMR is known for slow-walking US semiconductor mergers. Filed for approval. SAMR review could extend well into 2027.",
        steps: [
          { _key: k(), label: "SAMR filing", actual_date: "2025-12-15" },
          { _key: k(), label: "SAMR Phase I review (30 days)", expected_date: "2026-02-15" },
          { _key: k(), label: "SAMR Phase II review (90 days)", expected_date: "2026-05-15" },
          { _key: k(), label: "SAMR Phase III (60 days, if extended)", expected_date: "2026-07-15" },
          { _key: k(), label: "SAMR decision", expected_date: "2026-12-31", note: "Could extend significantly — semiconductor mergers often slow-walked" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "KFTC",
        outcome: "pending",
        steps: [
          { _key: k(), label: "KFTC filing", actual_date: "2025-12-15" },
          { _key: k(), label: "KFTC decision", expected_date: "2026-06-30" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "TFTC",
        outcome: "pending",
        steps: [
          { _key: k(), label: "TFTC filing", actual_date: "2025-12-15" },
          { _key: k(), label: "TFTC decision", expected_date: "2026-06-30" },
        ],
      },
      // FDI screening — individual country filings (consolidated timeline was
      // an editor estimate, not per-country confirmed dates, so dates
      // intentionally left blank)
      {
        _key: k(),
        jurisdiction: "ISC",
        outcome: "pending",
        outcome_summary: "FDI / investment screening review (Belgium).",
        steps: [
          { _key: k(), label: "FDI filing" },
          { _key: k(), label: "Decision" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "FDI",
        display_name: "France — FDI screening",
        outcome: "pending",
        outcome_summary: "FDI / investment screening review (France).",
        steps: [
          { _key: k(), label: "FDI filing" },
          { _key: k(), label: "Decision" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "BMWK",
        outcome: "pending",
        outcome_summary: "FDI / investment screening review (Germany, AWG/AWV regime).",
        steps: [
          { _key: k(), label: "FDI filing" },
          { _key: k(), label: "Decision" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "FDI",
        display_name: "Ireland — FDI screening",
        outcome: "pending",
        outcome_summary: "FDI / investment screening review (Ireland).",
        steps: [
          { _key: k(), label: "FDI filing" },
          { _key: k(), label: "Decision" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "PCM",
        outcome: "pending",
        outcome_summary: "FDI / Golden Powers review (Italy).",
        steps: [
          { _key: k(), label: "FDI filing" },
          { _key: k(), label: "Decision" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "BTI",
        outcome: "pending",
        outcome_summary: "FDI / investment screening review (Netherlands).",
        steps: [
          { _key: k(), label: "FDI filing" },
          { _key: k(), label: "Decision" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "SFI",
        outcome: "pending",
        outcome_summary: "FDI / investment screening review (Spain).",
        steps: [
          { _key: k(), label: "FDI filing" },
          { _key: k(), label: "Decision" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "NSIA",
        outcome: "pending",
        outcome_summary: "National Security and Investment Act screening (UK).",
        steps: [
          { _key: k(), label: "Filing" },
          { _key: k(), label: "Decision" },
        ],
      },
    ],
    shareholder_votes: [{ party: "target",
      outcome: "approved",
      label: "Both target and acquirer shareholders — approved February 11, 2026",
      outcome_summary:
        "Both Qorvo and Skyworks shareholders approved on February 11, 2026. Starboard Value (8% of QRVO) signed a voting agreement in support.",
      committed_pct: 8,
      committed_notes: "Starboard Value — signed voting agreement",
      steps: [
        { _key: k(), label: "Proxy statement filed", actual_date: "2025-12-11" },
        { _key: k(), label: "Shareholder votes — both approved", actual_date: "2026-02-11" },
      ],
    }],
    ctfn_probability: [
      p("Our 60% probability reflects FTC second-request uncertainty and SAMR slow-walk risk. The semiconductor sector has seen heightened antitrust scrutiny globally — SAMR in particular has used prolonged review timelines as leverage in US-China technology disputes."),
      p("The two-year merger agreement (outside date April 27, 2027 with extensions to October 27, 2027) provides significant runway, which is why the probability is not lower despite dual-front regulatory risk. The $100mn additional reverse termination fee for regulatory failure gives Qorvo shareholders meaningful downside protection."),
      p("The divestiture cap ($100mn for any single asset, $250mn combined) limits the parties' obligation to offer remedies, which could be a constraint if the FTC demands broader structural remedies in the RFFE market. Apple accounted for ~69% of Skyworks' revenue and ~46% of Qorvo's in FY2025 — Apple's view of the merger is a silent but significant factor."),
    ],
    risk_factors: [
      p("FTC second request: significant RFFE market overlap — both supply power amplifiers and front-end modules to Apple and Samsung."),
      p("SAMR slow-walk: China known for extended reviews of US semiconductor mergers as geopolitical leverage."),
      p("Customer concentration: Apple = 69% of SWKS revenue and 46% of QRVO revenue. Apple's position on the merger is a silent risk factor."),
      p("Divestiture cap ($100mn / $250mn) may limit ability to satisfy FTC if broader remedies are demanded."),
      p("9-country FDI screening in Europe adds secondary timeline risk."),
    ],
    shareholder_activism: [
      {
        _key: k(),
        date: "2025-10-28",
        actor: "Starboard Value (8% of Qorvo)",
        stance: "supportive",
        description:
          "Starboard Value, holding an 8% stake in Qorvo, signed a voting agreement in support of the transaction at announcement. Starboard's endorsement provides a meaningful committed vote block and signals activist investor confidence in the strategic logic.",
      },
    ],
    documents: [
      { _key: k(), title: "Press Release (10/28/25)", url: "https://www.qorvo.com/newsroom/news/2025/skyworks-and-qorvo-to-combine-to-create-22-billion-us-based-leader" },
      { _key: k(), title: "Skyworks 8-K Filing", url: "https://www.sec.gov/Archives/edgar/data/4127/000110465925102806/tm2529220d2_8k.htm" },
      { _key: k(), title: "Qorvo 8-K Filing", url: "https://www.sec.gov/Archives/edgar/data/1604778/000095010325013687/dp236368_8k-signing.htm" },
      { _key: k(), title: "Definitive Merger Agreement", url: "https://www.sec.gov/Archives/edgar/data/1604778/000110465925102809/tm2529220d2_ex2-1.htm" },
      { _key: k(), title: "Definitive Proxy (DEFM14A)", url: "https://www.sec.gov/Archives/edgar/data/1604778/000110465925124244/tm2534027-1_defm14a.htm" },
    ],
    trigger_alert: false,
    alert_summary: "FTC second request received; SAMR review ongoing. Shareholder votes approved February 11.",
  },

  // 10 ── SLAB / TXN — semiconductor acquisition
  {
    acquirer: "Texas Instruments",
    target: "Silicon Labs",
    acquirer_ticker: "TXN",
    target_ticker: "SLAB",
    status: "ongoing",
    sector: "technology",
    target_jurisdiction: "Delaware",
    deck: "HSR cleared April 20 (waiting period expired, no second request). SAMR approval required — China known for slow-walking US semiconductor deals. Shareholder vote scheduled April 30.",
    key_risk_summary:
      "The transaction requires approval from China's SAMR, which has slow-walked clearing deals in recent years. Our analyst team notes recent unsuccessful deals that didn't receive timely approval from SAMR including Qualcomm's attempted acquisition of NXP Semiconductors which was terminated in 2018, and Intel's attempted acquisition of Tower Semiconductor which was terminated in 2023.",
    equity_value: 7600,
    shares_outstanding: 33,
    offer_price: 231,
    offer_terms: "$231 per share in cash",
    premium: 69,
    premium_reference: "vs SLAB unaffected close on February 3",
    termination_fee: 259,
    termination_fee_pct: 3.4,
    reverse_termination_fee: 499,
    reverse_termination_fee_pct: 6.6,
    financing:
      "Texas Instruments expects to fund the merger with a combination of cash on hand and debt financing to be arranged prior to closing.",
    ctfn_estimated_close: "2027-01-15",
    ctfn_probability_notes:
      "SAMR is the primary gating risk. HSR straightforward. 69% premium provides strong shareholder support.",
    announcement_date: "2026-02-04",
    published_date: "2026-02-04",
    next_key_event_date: "2026-04-30",
    next_key_event_label: "Shareholder vote",
    outside_date: "2027-02-04",
    outside_date_final: "2028-02-04",
    outside_date_notes:
      "Subject to two automatic extensions to August 4, 2027, and to February 4, 2028.",
    closing_guidance: "H1 2027",
    best_efforts:
      "The parties shall defend the transaction in court if needed for regulatory clearance.",
    target_advisors:
      "Qatalyst Partners is serving as financial advisor. DLA Piper is serving as legal counsel. FGS Global is running PR.",
    acquirer_advisors:
      "Goldman Sachs is serving as financial advisor. A&O Shearman is serving as legal counsel. Joele Frank, Wilkinson Brimmer Katcher is running PR.",
    free_preview: [
      p("Texas Instruments is acquiring Silicon Labs for $231 per share in cash, implying an equity value of $7.6bn. The 69% premium to the target's unaffected close on February 3 reflects Silicon Labs' position as a pure-play IoT wireless connectivity platform."),
      p("HSR was filed on March 20 and the waiting period expired April 20 without a second request, clearing the US antitrust review. The transaction is also subject to approval by China's SAMR, which is known for slow-walking US semiconductor mergers. A Silicon Labs shareholder vote is scheduled for April 30, 2026."),
    ],
    background: [
      p("For a few years, the board and management of Silicon Labs periodically reviewed operations and evaluated strategic alternatives."),
      p("On September 5, 2023, Silicon Labs engaged Qatalyst Partners to help on strategy."),
      p("On July 23, 2025, Qatalyst presented to the board on shareholder-activism risk, M&A trends in the semiconductor industry, and a potential combination with Party A."),
      p("On October 23, the board authorized management to prepare an acquisition proposal for Party A."),
      p("On October 26, the CEO of Party B indicated to Silicon Labs' CEO a potential interest in acquiring Silicon Labs."),
      p("On November 9, Party B submitted an unsolicited non-binding proposal to acquire Silicon Labs for $200 per share in cash, conditioned on a 21-day exclusivity period and completion of due diligence."),
      p("On November 14, the target board instructed management to proceed with a proposal to Party A while continuing to evaluate Party B's offer."),
      p("On November 20, Silicon Labs delivered a non-binding acquisition proposal to Party A. On November 25, the board reviewed preliminary financial analyses and directed management and advisors to engage Party B while also contacting additional potential strategic counterparties, including Texas Instruments, Party C and Party D."),
      p("On November 26, Party A declined Silicon Labs' proposal, and Silicon Labs initiated outreach to Texas Instruments, Party C and Party D."),
      p("Between late November and early December 2025, Silicon Labs entered NDAs with Texas Instruments, Party C and Party D and held management talks with each party."),
      p("On December 5, the board authorized outreach to Party E."),
      p("On December 11, Party D declined to submit an offer."),
      p("On December 15, Silicon Labs conducted a management presentation for Party B. By mid December, Texas Instruments and Party B remained engaged in the process."),
      p("On December 22, Party B submitted a revised non-binding proposal to buy Silicon Labs for $204 per share in cash and again requested exclusivity. On December 23, Texas Instruments submitted a non-binding proposal to acquire Silicon Labs for between $205 and $210 per share in cash without a financing condition."),
      p("On December 30, the board reviewed both proposals and concluded that neither offer price was sufficient, directing advisors to inform both parties and to continue the process, including by contacting Party F."),
      p("On December 31, Texas Instruments and Party B advanced to the next phase of the process and were granted access to a virtual data room, with final bids requested by January 27, 2026."),
      p("In January 2026, Silicon Labs conducted extensive due-diligence sessions with Texas Instruments and Party B while also engaging Party F."),
      p("On January 26, Party B told Silicon Labs that its board would not support increasing its offer price."),
      p("On January 27, Party B withdrew from the process. That same day, Texas Instruments submitted a revised proposal to buy Silicon Labs for $231 per share in cash, requesting a seven-day exclusivity period and confirming that the transaction would be financed with balance-sheet cash and investment-grade capital-markets financing. Also on January 27, Party F submitted a non-binding indication of interest to acquire Silicon Labs for $205 per share in cash, subject to further due diligence."),
      p("On January 29, the board reviewed the proposals from Texas Instruments and Party F and directed management to proceed with Texas Instruments at $231 per share. On February 3, the board received Qatalyst's opinion that the $231-per-share cash consideration was fair and unanimously approved the merger agreement."),
      p("Shortly after midnight on February 4, Silicon Labs and Texas Instruments executed the merger agreement, and later that morning they announced the transaction."),
    ],
    commentary: [
      p("Silicon Labs develops low-power connectivity, designing embedded technology that links devices."),
    ],
    filings: [
      {
        _key: k(),
        jurisdiction: "HSR",
        outcome: "cleared",
        outcome_summary: "HSR filed March 20. Waiting period expired April 20 with no second request.",
        steps: [
          { _key: k(), label: "HSR filed", actual_date: "2026-03-20" },
          { _key: k(), label: "HSR waiting period expires", actual_date: "2026-04-20" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "SAMR",
        outcome: "pending",
        outcome_summary: "SAMR approval required. China known for slow-walking US semiconductor mergers — Qualcomm/NXP terminated 2018, Intel/Tower terminated 2023.",
        steps: [
          { _key: k(), label: "SAMR filing", expected_date: "2026-04-30" },
          { _key: k(), label: "SAMR Phase I (30 days)", expected_date: "2026-06-01" },
          { _key: k(), label: "SAMR Phase II (90 days)", expected_date: "2026-08-30" },
          { _key: k(), label: "SAMR Phase III (60 days, if extended)", expected_date: "2026-10-30" },
          { _key: k(), label: "SAMR decision", expected_date: "2027-01-15", note: "Could extend significantly given semiconductor precedents" },
        ],
      },
    ],
    shareholder_votes: [{ party: "target",
      outcome: "pending",
      label: "Target shareholders — vote scheduled April 30, 2026",
      steps: [
        { _key: k(), label: "Proxy statement filed", actual_date: "2026-03-12" },
        { _key: k(), label: "Shareholder vote", expected_date: "2026-04-30" },
      ],
    }],
    ctfn_probability: [
      p("Our 62% probability reflects SAMR as the primary gating risk. The HSR process appears straightforward — the overlap in embedded processing and wireless connectivity is real but the combined market shares are unlikely to trigger an FTC challenge given the fragmented nature of the IoT semiconductor market."),
      p("The 69% premium is exceptionally high and reflects TI's strategic conviction that Silicon Labs' wireless IoT platform is a must-have asset for its long-term portfolio. The premium also substantially reduces the risk of shareholder opposition or competing bids."),
      p("The two-year merger agreement (outside date February 4, 2027 with extensions to February 4, 2028) provides significant runway for SAMR review. However, the precedent of Qualcomm/NXP (SAMR never formally denied — just slow-walked until the parties gave up) and Intel/Tower (terminated after SAMR delays) makes China the binary risk."),
    ],
    ctfn_target_company: [
      p("Silicon Labs is a leading innovator in secure, intelligent wireless technology and mixed-signal solutions purposed for the Internet of Things (IoT). The company specializes in low-power wireless connectivity, providing a broad platform of System-on-Chips (SoCs), modules, and software that support a variety of protocols, including Bluetooth, Wi-Fi, Matter, Zigbee, Z-Wave, Thread, Wi-SUN, and sub-GHz proprietary technologies. Use cases for its hardware and software solutions range from smart home thermostats, security systems, and municipal energy grids to industrial automation, connected health devices (such as heart monitors), and smart retail assets. Silicon Labs distinguishes itself through its expertise in high-performance analog and mixed-signal integrated circuit (IC) design, as well as its proprietary Simplicity Studio software development environment, which simplifies the complexity of radio frequency (RF) design from silicon to cloud."),
    ],
    ctfn_acquirer_company: [
      p("Texas Instruments (TI) is a global semiconductor company that designs, manufactures, and sells analog and embedded processing chips for a vast array of electronic applications. Its Analog segment focuses on managing power requirements and signal processing through products such as battery-management solutions, DC/DC regulators, and linear devices. The Embedded Processing segment provides the digital 'brains' for electronic equipment, ranging from low-cost microcontrollers for consumer goods like electric toothbrushes to complex, specialized devices for motor control and industrial automation. A key technical differentiator for TI is its strategy of vertical integration, owning and operating 300mm wafer fabrication facilities that provide a dependable, low-cost supply of chips."),
    ],
    ctfn_overlaps: [
      p("The companies have a direct and significant overlap in the Embedded Processing and Wireless Connectivity markets. Both TI and Silicon Labs develop and sell microcontrollers and wireless SoCs targeted at the industrial and IoT end markets. Specifically, Silicon Labs' leadership in secure wireless protocols (like Zigbee and Matter) for smart homes and infrastructure overlaps with TI's existing embedded wireless portfolio designed for communications and industrial equipment. Furthermore, both companies offer mixed-signal and power management solutions, such as digital isolators and sensors, used in industrial automation and power supply systems."),
    ],
    ctfn_rationale_synergies: [
      p("The acquisition, valued at approximately $7.5bn in cash, aims to combine Silicon Labs' best-in-class wireless connectivity expertise with TI's massive manufacturing scale and market reach. Strategically, TI intends to 'reshore' Silicon Labs' manufacturing from external foundries to its own internally owned 300mm wafer fabs, which is expected to yield approximately $450mn in annual manufacturing and operational synergies within three years post-close. This move is designed to provide customers with a more dependable supply while reducing costs through TI's superior production efficiency. Additionally, the deal allows TI to cross-sell Silicon Labs' 1,200 wireless products through its extensive market channels and direct-to-customer e-commerce platform, deepening engagement across industrial and automotive customer bases."),
    ],
    ctfn_competition: [
      p("Silicon Labs identifies primary competitors as Broadcom, Espressif, Infineon, MediaTek, Microchip, Nordic Semiconductor, NXP, Qualcomm, Renesas, STMicroelectronics, Synaptics, Telink and Texas Instruments."),
    ],
    ctfn_precedent_transactions: [
      p("In 2011, Texas Instruments acquired National Semiconductor for $6.5bn, which remains one of the largest analog semiconductor deals to date and served as a model for TI's consolidation strategy."),
      p("In 2021, Skyworks Solutions acquired Silicon Labs' Infrastructure & Automotive business for $2.75bn, leaving Silicon Labs as a pure-play IoT company until this current transaction."),
      p("Because the transaction requires approval from China's SAMR, which has slow-walked clearing deals in recent years, our analyst team notes recent unsuccessful deals that didn't receive timely approval from SAMR including Qualcomm's attempted acquisition of NXP Semiconductors which was terminated in 2018, and Intel's attempted acquisition of Tower Semiconductor which was terminated in 2023."),
    ],
    risk_factors: [
      p("SAMR slow-walk: China has a track record of using extended review timelines as leverage in US semiconductor deals (Qualcomm/NXP terminated 2018, Intel/Tower terminated 2023)."),
      p("Geopolitical overlay: US-China semiconductor tensions remain elevated; SAMR review of a US-to-US semiconductor deal may be influenced by broader trade dynamics."),
      p("FDI screening in multiple jurisdictions adds secondary timeline risk."),
      p("Integration of Silicon Labs' fabless model into TI's vertically integrated 300mm fabs is operationally complex."),
    ],
    documents: [
      { _key: k(), title: "Press Release (2/4/26)", url: "https://www.prnewswire.com/news-releases/texas-instruments-to-acquire-silicon-labs-302678832.html" },
      { _key: k(), title: "Definitive Merger Agreement", url: "https://www.sec.gov/Archives/edgar/data/1038074/000119312526036712/d62897dex21.htm" },
      { _key: k(), title: "Definitive Proxy Statement (DEFM14A)", url: "https://www.sec.gov/Archives/edgar/data/1038074/000119312526128959/d34834ddefm14a.htm" },
    ],
    trigger_alert: false,
    alert_summary: "HSR cleared April 20. Shareholder vote scheduled April 30.",
  },

  // 11 ── SKYT / IONQ — quantum computing + semiconductor fab
  {
    acquirer: "IonQ",
    target: "SkyWater Technology",
    acquirer_ticker: "IONQ",
    target_ticker: "SKYT",
    status: "ongoing",
    sector: "technology",
    target_jurisdiction: "Delaware",
    deck: "HSR pulled and refiled March 25; waiting period now expires April 24. Shareholder vote May 8. Cash-and-stock deal with collar mechanism on IonQ shares.",
    key_risk_summary:
      "HSR waiting period expires April 24 following a pull-and-refile on March 25. The transaction combines a quantum computing company with a semiconductor foundry — a novel combination that may draw scrutiny on national security grounds given SkyWater's defense and intelligence community contracts.",
    equity_value: 1450,
    shares_outstanding: 49,
    offer_price: 35,
    offer_terms: "$15 cash + $20 IonQ stock per share (collar: $37.99-$60.13)",
    premium: 38,
    premium_reference: "vs 30-day VWAP of SkyWater shares as of January 23",
    termination_fee: 51.6,
    termination_fee_pct: 3.6,
    financing:
      "Cash and stock. The cash component is funded from IonQ's balance sheet and the stock component is subject to a collar mechanism protecting SkyWater shareholders within the $37.99–$60.13 IonQ price range.",
    ctfn_estimated_close: "2026-08-15",
    ctfn_probability_notes:
      "Relatively straightforward HSR given limited direct product overlap. Collar mechanism adds deal-certainty. 20% voting agreement from SkyWater shareholders provides committed support.",
    announcement_date: "2026-01-26",
    published_date: "2026-01-27",
    next_key_event_date: "2026-04-24",
    next_key_event_label: "HSR expiration",
    outside_date: "2027-01-25",
    outside_date_final: "2027-07-24",
    outside_date_notes:
      "Subject to two automatic 90-day extensions, to April 25, 2027 and July 24, 2027.",
    closing_guidance: "Q2 or Q3 2026",
    best_efforts:
      "The parties shall divest assets and defend the transaction in court if needed to get regulatory clearance.",
    target_advisors:
      "Goldman Sachs is serving as exclusive financial advisor. Foley & Lardner is serving as legal counsel. FGS Global is running PR.",
    acquirer_advisors:
      "Cantor Fitzgerald and BofA are serving as financial advisors. Paul, Weiss, Rifkind, Wharton & Garrison are serving as legal counsel. Joele Frank, Wilkinson Brimmer Katcher is running PR.",
    free_preview: [
      p("IonQ is acquiring SkyWater Technology for $15 in cash and $20 in IonQ shares per SkyWater share, implying a $1.45bn equity value and a 38% premium to SkyWater's 30-day VWAP. The stock component is subject to a collar — SkyWater shareholders receive exactly $20 worth of IonQ stock as long as IonQ trades between $37.99 and $60.13, with a fixed share count if the price falls outside that range."),
      p("HSR was filed February 20 and subsequently pulled and refiled on March 25, with the waiting period now scheduled to expire on April 24. The shareholder vote is set for May 8, 2026."),
    ],
    background: [],
    commentary: [
      p("SkyWater shareholders will own between 4.4% and 6.7% of the combined company. Shareholders representing about 20% of SkyWater's voting power have signed a binding agreement to vote in favor of the merger."),
    ],
    filings: [
      {
        _key: k(),
        jurisdiction: "HSR",
        outcome: "pending",
        outcome_summary: "HSR filed February 20. Parties pulled and refiled on March 25. Waiting period now scheduled to expire April 24.",
        steps: [
          { _key: k(), label: "HSR filed", actual_date: "2026-02-20" },
          { _key: k(), label: "HSR pulled and refiled", actual_date: "2026-03-25" },
          { _key: k(), label: "HSR waiting period expires", expected_date: "2026-04-24" },
          { _key: k(), label: "Second request (if issued)", note: "Would extend timeline significantly" },
        ],
      },
    ],
    shareholder_votes: [{ party: "target",
      outcome: "pending",
      label: "Target shareholders — May 8, 2026",
      committed_pct: 20,
      committed_notes: "SkyWater shareholders representing ~20% of voting power signed binding agreement",
      steps: [
        { _key: k(), label: "Proxy statement filed", actual_date: "2026-03-15" },
        { _key: k(), label: "Shareholder vote", expected_date: "2026-05-08" },
      ],
    }],
    ctfn_probability: [],
    risk_factors: [
      p("HSR pull-and-refile suggests potential regulatory friction — parties may have needed additional time or pre-clearance discussions with the FTC/DOJ."),
      p("SkyWater's defense and intelligence community contracts could raise national security considerations beyond standard antitrust review."),
      p("IonQ stock price volatility affects the effective consideration — collar mechanism provides partial protection but breaks outside $37.99–$60.13 range."),
    ],
    documents: [
      { _key: k(), title: "Press Release (1/26/26)", url: "https://investors.ionq.com/news/news-details/2026/IonQ-to-Acquire-SkyWater-Technology-Creating-the-Only-Vertically-Integrated-Full-Stack-Quantum-Platform-Company/default.aspx" },
      { _key: k(), title: "Definitive Merger Agreement", url: "https://www.sec.gov/Archives/edgar/data/1824920/000119312526021616/d10479dex21.htm" },
      { _key: k(), title: "Definitive Proxy Statement", url: "https://www.sec.gov/Archives/edgar/data/1819974/000119312526134924/d134181ddefm14a.htm" },
    ],
    trigger_alert: false,
    alert_summary: "HSR waiting period expires April 24; shareholder vote May 8.",
  },

  // 12 ── WTRG / AWK — water utilities merger
  {
    acquirer: "American Water Works",
    target: "Essential Utilities",
    acquirer_ticker: "AWK",
    target_ticker: "WTRG",
    status: "ongoing",
    sector: "energy",
    target_jurisdiction: "Pennsylvania",
    deck: "Both shareholder bases approved February 10, 2026. Pennsylvania PUC is the central review — parties seeking Q3 2026 conclusion. 10+ state utility commissions require approval.",
    key_risk_summary:
      "Pennsylvania is likely to be the central review, and the parties are seeking to have it concluded in the third quarter of 2026. The transaction is also subject to approvals from the Illinois Commerce Commission, Kentucky Public Service Commission, New Jersey Board of Public Utilities, North Carolina Utilities Commission, Pennsylvania Public Utility Commission, Public Utility Commission of Texas, Virginia State Corporation Commission, and parties may need to notify the California Public Utilities Commission, Indiana Utility Regulatory Commission and the Public Utilities Commission of Ohio, as well as any other state public-utility commission that asserts jurisdiction.",
    equity_value: 12200,
    shares_outstanding: 283,
    offer_price: 43.18,
    offer_terms: "0.305 shares of American Water common stock for each share of Essential they own, implying $43.18 per share",
    premium: 10,
    premium_reference: "based on 60-day VWAP of each company's common stock over the 60-trading-day period ending October 24",
    termination_fee: 370,
    termination_fee_pct: 3,
    reverse_termination_fee: 835,
    reverse_termination_fee_pct: 6.8,
    financing:
      "All stock. No cash component, no debt financing required.",
    ctfn_estimated_close: "2027-03-15",
    ctfn_probability_notes:
      "10+ state utility commissions create multi-jurisdictional complexity. Pennsylvania PUC is the central and most complex review. All-stock structure removes financing risk.",
    announcement_date: "2025-10-27",
    published_date: "2025-10-27",
    next_key_event_date: "2026-06-21",
    next_key_event_label: "PPUC docket",
    outside_date: "2027-04-26",
    outside_date_final: "2027-10-26",
    outside_date_notes:
      "May be extended for a period of three months up to two times, until October 26, 2027.",
    closing_guidance: "Q1 2027",
    best_efforts:
      "The parties shall divest assets and defend the transaction in court if needed to win clearance.",
    target_advisors:
      "Moelis & Company is serving as exclusive financial advisor. Gibson, Dunn & Crutcher is serving as legal counsel. Joele Frank, Wilkinson Brimmer Katcher is running PR.",
    acquirer_advisors:
      "Bank of America is serving as exclusive financial advisor. Skadden, Arps, Slate, Meagher & Flom is serving as legal counsel. Joele Frank, Wilkinson Brimmer Katcher is running PR on this side of the transaction, too.",
    free_preview: [
      p("American Water Works is acquiring Essential Utilities in an all-stock transaction. Essential shareholders will receive 0.305 shares of American Water common stock for each share of Essential they own, implying $43.18 per share — a 10% premium based on 60-day VWAP of each company's common stock over the 60-trading-day period ending October 24."),
      p("Both target and acquirer shareholders approved on February 10, 2026. The parties shall file under HSR as well as with the US Federal Communications Commission and any other necessary regulator within 60 days post-DMA, or by December 26, 2025. Pennsylvania is likely to be the central review, and the parties are seeking to have it concluded in the third quarter of 2026."),
    ],
    background: [
      p("From time to time prior to 2025, the boards and senior management of American Water and Essential regularly reviewed strategic options."),
      p("On June 4, 2025, after his appointment as CEO of American Water, John Griffith contacted his counterpart at Essential, Christopher Franklin, to initiate executive-level discussions."),
      p("On June 18, they met and discussed general business matters."),
      p("On July 15, Franklin met with Essential chair Karl Kurz and discussed the possibility of re-engaging regarding a potential transaction."),
      p("On July 23, Griffith and Franklin discussed a potential all-stock transaction framework, including that Essential shareholders would receive a premium and that post-closing governance would be shared between the companies."),
      p("On July 30, the American Water board reviewed these discussions and authorized continued engagement, and the Essential board separately authorized continued deal talks."),
      p("On August 5, Griffith and Franklin discussed an all-stock, fixed-exchange-ratio transaction reflecting a potential premium of 10% for Essential shareholders, post-closing governance, and regulatory considerations."),
      p("On August 20, the parties continued talks regarding board composition and executive roles."),
      p("On August 24, the parties aligned on key governance concepts and agreed to enter into an NDA to facilitate due diligence."),
      p("On August 25, the parties executed an NDA containing customary standstill provisions."),
      p("Between late August and September, the parties started reciprocal due diligence, opened data rooms, and exchanged non-public information on financial performance, capital plans, regulatory matters and Essential's natural-gas operations."),
      p("On September 4, American Water delivered a draft term sheet for an all-stock merger reflecting a premium to Essential shareholders."),
      p("On September 29, the Essential board reviewed the draft merger agreement, including regulatory approval obligations and no-shop provisions, and authorized continued negotiations."),
      p("On September 30, the American Water board reviewed due-diligence progress and directed management to continue negotiations."),
      p("Between early and mid October, the parties negotiated the merger agreement, including regulatory covenants, interim operating covenants, employee matters, the definition of burdensome effect, termination fees and the exchange ratio, and Essential shared its updated five-year plan."),
      p("On October 24, the American Water board reviewed the agreed exchange ratio of 0.305 shares of American Water common stock for each share of Essential common stock and approved the transaction."),
      p("On October 26, the Essential board approved the transaction at the agreed exchange ratio."),
      p("On October 26, the parties executed their merger agreement, and, on October 27, before markets opened, they announced the transaction."),
    ],
    commentary: [
      p("American Water shareholders will own 69%, and Essential shareholders will own 31%, of the combined company on a fully diluted basis."),
    ],
    filings: [
      {
        _key: k(),
        jurisdiction: "HSR",
        outcome: "pending",
        outcome_summary: "Parties were required to file within 60 days post-DMA (by December 26, 2025). Clearance expected Q1 2026; currently past the initial expected clearance date with no second-request reporting.",
        steps: [
          { _key: k(), label: "HSR filed", actual_date: "2025-12-26", note: "On or before the 60-day post-DMA deadline" },
          { _key: k(), label: "HSR clearance", expected_date: "2026-03-30" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "FCC",
        outcome: "pending",
        outcome_summary: "FCC filing required within 60 days post-DMA. Clearance timeline typically 6 months.",
        steps: [
          { _key: k(), label: "FCC filing submitted", actual_date: "2025-12-26", note: "On or before the 60-day post-DMA deadline" },
          { _key: k(), label: "FCC clearance", expected_date: "2026-06-30" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "PPUC",
        outcome: "pending",
        outcome_summary: "Pennsylvania is likely to be the central review (docket A-2025-3058927). Parties seeking to have it concluded in Q3 2026. Multiple PPUC docket dates scheduled through September 2026.",
        case_url: "https://www.puc.pa.gov/docket/A-2025-3058927",
        steps: [
          { _key: k(), label: "Pennsylvania PUC application filed", actual_date: "2025-11-26" },
          { _key: k(), label: "PPUC docket", expected_date: "2026-06-21" },
          { _key: k(), label: "PPUC docket", expected_date: "2026-06-25" },
          { _key: k(), label: "PPUC docket", expected_date: "2026-07-23" },
          { _key: k(), label: "PPUC docket", expected_date: "2026-07-29" },
          { _key: k(), label: "PPUC docket", expected_date: "2026-08-03" },
          { _key: k(), label: "PPUC docket", expected_date: "2026-08-04" },
          { _key: k(), label: "PPUC docket", expected_date: "2026-08-05" },
          { _key: k(), label: "PPUC decision target (Q3 2026)", expected_date: "2026-09-24" },
        ],
      },
      // Individual state PUC filings — approvals required
      {
        _key: k(),
        jurisdiction: "ICC",
        outcome: "pending",
        outcome_summary: "Illinois docket 25-1057 — Application for Approval of Reorganization filed December 5, 2025.",
        case_url: "https://www.icc.illinois.gov/docket/P2025-1057",
        steps: [
          { _key: k(), label: "Application filed", actual_date: "2025-12-05" },
          { _key: k(), label: "Commission decision", note: "Review timelines typically 6-12 months" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "KPSC",
        outcome: "pending",
        outcome_summary: "Approval required for utility holding company change. Filing required within 60 days post-DMA.",
        steps: [
          { _key: k(), label: "Application filed", actual_date: "2025-12-26", note: "On or before the 60-day post-DMA deadline (Oct 27, 2025 + 60d)" },
          { _key: k(), label: "Commission decision", note: "Review timelines typically 6-12 months" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "NJBPU",
        outcome: "pending",
        outcome_summary: "Approval required for utility holding company change. Filing required within 60 days post-DMA.",
        steps: [
          { _key: k(), label: "Application filed", actual_date: "2025-12-26", note: "On or before the 60-day post-DMA deadline (Oct 27, 2025 + 60d)" },
          { _key: k(), label: "Commission decision", note: "Review timelines typically 6-12 months" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "NCUC",
        outcome: "pending",
        outcome_summary: "Approval required for utility holding company change. Filing required within 60 days post-DMA.",
        steps: [
          { _key: k(), label: "Application filed", actual_date: "2025-12-26", note: "On or before the 60-day post-DMA deadline (Oct 27, 2025 + 60d)" },
          { _key: k(), label: "Commission decision", note: "Review timelines typically 6-12 months" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "PUCT",
        outcome: "pending",
        outcome_summary: "Approval required for utility holding company change. Filing required within 60 days post-DMA.",
        steps: [
          { _key: k(), label: "Application filed", actual_date: "2025-12-26", note: "On or before the 60-day post-DMA deadline (Oct 27, 2025 + 60d)" },
          { _key: k(), label: "Commission decision", note: "Review timelines typically 6-12 months" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "VSCC",
        outcome: "pending",
        outcome_summary: "Virginia SCC case PUR-2025-00229 — joint petition of American Water Works, Alpha Merger Sub, Essential Utilities, and Aqua Virginia.",
        case_url: "https://www.scc.virginia.gov/case-information/submit-public-comments/cases/pur-2025-00229-.html",
        steps: [
          { _key: k(), label: "Application filed", actual_date: "2025-12-26", note: "On or before the 60-day post-DMA deadline (Oct 27, 2025 + 60d)" },
          { _key: k(), label: "Commission decision", note: "Review timelines typically 6-12 months" },
        ],
      },
      // Notification / possibly required — jurisdiction status not yet confirmed
      {
        _key: k(),
        jurisdiction: "CPUC",
        outcome: "pending",
        outcome_summary: "Notification possible; approval may be required depending on jurisdictional assertion.",
        steps: [
          { _key: k(), label: "Notification / filing (if required)" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "IURC",
        outcome: "pending",
        outcome_summary: "Notification possible; approval may be required depending on jurisdictional assertion.",
        steps: [
          { _key: k(), label: "Notification / filing (if required)" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "PUCO",
        outcome: "pending",
        outcome_summary: "Notification possible; approval may be required depending on jurisdictional assertion.",
        steps: [
          { _key: k(), label: "Notification / filing (if required)" },
        ],
      },
    ],
    shareholder_votes: [{ party: "target",
      outcome: "approved",
      label: "Both target and acquirer shareholders — approved February 10, 2026",
      steps: [
        { _key: k(), label: "Proxy statement filed", actual_date: "2025-12-15" },
        { _key: k(), label: "Shareholder votes — both approved", actual_date: "2026-02-10" },
      ],
    }],
    ctfn_probability: [
      p("Our 68% probability reflects the multi-jurisdictional complexity — 10+ state utility commissions each review independently and on their own timelines. Pennsylvania PUC is the critical path and the most complex review given Essential's significant natural-gas operations in the state."),
      p("The all-stock, fixed-exchange-ratio structure eliminates financing risk and aligns both shareholder bases. The 10% premium is modest by M&A standards but consistent with utility 'merger of equals' transactions where the strategic rationale is about operational scale rather than a control premium."),
      p("The $835mn reverse termination fee (6.8%) provides strong downside protection for Essential shareholders if regulatory approvals fail. The asymmetry with the $370mn target fee (3%) reflects that regulatory risk is primarily borne by the acquirer."),
    ],
    risk_factors: [
      p("Pennsylvania PUC central review: Essential's natural-gas operations in PA add complexity beyond water/wastewater."),
      p("10+ state utility commissions require approval — each on independent timelines with independent conditions."),
      p("Any state commission that 'asserts jurisdiction' could add unexpected regulatory hurdles."),
      p("Essential's natural-gas business may face additional scrutiny in states with clean-energy policy agendas."),
      p("Fixed exchange ratio means Essential shareholders bear American Water stock price risk between announcement and close."),
    ],
    documents: [
      { _key: k(), title: "Press Release (10/27/25)", url: "https://www.essential.co/news-releases/news-release-details/american-water-and-essential-utilities-merge-leading-regulated" },
      { _key: k(), title: "8-K Filing (WTRG)", url: "https://www.sec.gov/Archives/edgar/data/78128/000155278125000341/e25376_wtrg-8k.htm" },
      { _key: k(), title: "Definitive Merger Agreement", url: "https://www.sec.gov/Archives/edgar/data/78128/000155278125000341/e25376_ex2-1.htm" },
      { _key: k(), title: "Definitive Proxy Statement (DEFM14A)", url: "https://www.sec.gov/Archives/edgar/data/78128/000119312526037599/d77595ddefm14a.htm" },
    ],
    trigger_alert: false,
    alert_summary: "Pennsylvania PUC docket hearings begin June; parties targeting Q3 2026 conclusion.",
  },

  // 13 ── CWAN / Permira + Warburg Pincus — fintech take-private
  {
    acquirer: "Permira / Warburg Pincus",
    target: "Clearwater Analytics",
    target_ticker: "CWAN",
    status: "ongoing",
    sector: "technology",
    target_jurisdiction: "Delaware",
    deck: "Shareholder vote May 6; EC Phase I clearance expected same day. Go-shop contacted 44 bidders — none submitted competing bid. Multiple plaintiff firms investigating conflicts of interest given buyers' insider status.",
    key_risk_summary:
      "SAMR timing; FIRB timing (given Temasek involvement). Multiple plaintiff law firms allege conflicts of interest — Permira and Warburg Pincus are existing insider stockholders with board representation who possessed material non-public information about CWAN's growth trajectory. The buyout was agreed less than two weeks after Starboard Value disclosed a 5% activist stake.",
    equity_value: 7000,
    shares_outstanding: 289,
    offer_price: 24.55,
    offer_terms: "$24.55 cash per share",
    premium: 47,
    premium_reference: "vs CWAN unaffected close on November 10",
    termination_fee: 242,
    termination_fee_pct: 3.5,
    reverse_termination_fee: 521.1,
    reverse_termination_fee_pct: 7.4,
    termination_fee_notes:
      "$111.7mn during go-shop period, $242mn otherwise. Reverse termination fee: $521.1mn.",
    financing:
      "Not conditioned on financing. Debt commitments total $3.525 billion (senior secured term loan + DDTL + revolver), provided by Goldman Sachs Asset Management and others via an amended and restated commitment letter dated January 21, 2026.",
    ctfn_estimated_close: "2026-06-30",
    ctfn_probability_notes:
      "HSR cleared. EC super-simplified Phase I. Go-shop confirmed no competing bid. SAMR and FIRB are the remaining timing variables. Strong base case for Q2 close in line with management guidance.",
    announcement_date: "2025-12-21",
    published_date: "2025-12-27",
    next_key_event_date: "2026-05-06",
    next_key_event_label: "Shareholder vote + EC Phase I clearance",
    outside_date: "2026-09-20",
    outside_date_final: "2026-12-20",
    outside_date_notes:
      "Subject to a three month extension to December 20, 2026.",
    closing_guidance: "Q2 2026",
    best_efforts:
      "The parties shall divest and defend the transaction if required.",
    target_advisors:
      "PJT Partners is serving as the exclusive financial advisor, and Cravath, Swaine & Moore is serving as legal counsel to the special committee of the CWAN board. JP Morgan is serving as the exclusive financial advisor, and Kirkland & Ellis is serving as legal counsel to CWAN.",
    acquirer_advisors:
      "Goldman Sachs is acting as financial advisor to the Investor Group. Private Credit at Goldman Sachs Alternatives provided 100% committed debt financing to the Investor Group. Latham and Watkins is serving as M&A counsel to the Investor Group. Paul, Weiss, Rifkind, Wharton & Garrison is serving as finance counsel to the Investor Group.",
    free_preview: [
      p("Clearwater Analytics is being taken private by a consortium led by Permira and Warburg Pincus, supported by Francisco Partners and with participation from Temasek, for $24.55 per share in cash — implying a $7bn equity value ($8.4bn including debt) and a 47% premium to the unaffected close on November 10."),
      p("HSR early termination was granted February 13. The EC notified the deal as a super-simplified review on March 26 with Phase I expiring May 6. The shareholder vote is also set for May 6. A go-shop period ran from December 22 to January 23 and reached 44 potential bidders — six executed NDAs but none submitted a competing bid."),
    ],
    background: [
      p("During the second half of 2020, Carbon Analytics, as Clearwater Analytics' holdco was then known, ran a recapitalization process, contacting about 29 financial sponsors, including Warburg Pincus and Permira. This resulted in investments from Warburg Pincus and Permira while Welsh Carson remained the majority stockholder."),
      p("On September 28, 2021, Clearwater Analytics completed its IPO at $18 per share and adopted an Up-C structure, with voting control concentrated among Welsh Carson, Warburg Pincus, and Permira."),
      p("During the fall of 2023, Clearwater Analytics conducted a market check, contacting eight parties, but it got no indications of interest."),
      p("During 2024 and the second quarter of 2025, the company's principal equity owners cut their holdings below board-nomination thresholds, resulting in termination of the company's stockholders agreement."),
      p("On August 1, 2025, following trading volatility after recent acquisitions, directors first raised the possibility of a take-private by Permira."),
      p("On August 7 and August 15, representatives of Warburg Pincus expressed continued interest in exploring a potential transaction but did not discuss price."),
      p("On October 23, Warburg Pincus and Permira submitted a preliminary non-binding proposal to acquire the company for $24.50 per share in cash, representing a 29% premium, conditioned on special-committee approval, majority-of-minorities stockholder approval and two weeks of exclusivity with a post-signing go-shop."),
      p("On October 29, a special committee of the company's board declined exclusivity and authorized limited due diligence under standstill NDAs."),
      p("On November 19, the special committee authorized a targeted pre-signing market check, contacting strategics and sponsors with a December 12 bid deadline."),
      p("On December 14, Sponsor Party A submitted a non-binding proposal of $20 to $22 per share. Later that day, the consortium of Warburg Pincus and Permira submitted a $24.25-per-share cash proposal requiring exclusivity."),
      p("On December 15, the special committee rejected both proposals and countered at $25.75 per share with a go-shop, reduced termination fee and 7% reverse termination fee."),
      p("Later on December 15, the consortium revised its offer to $24.35 per share, a 20-day go-shop, a 3.5% termination fee (1.75% go-shop) and a 6.5% reverse termination fee."),
      p("On December 16, after further negotiations, the consortium increased its price to $24.50 per share and then agreed to $24.55 per share in cash, a 7% reverse termination fee, a 3.25% termination fee (1.5% go-shop) and a go-shop period ending January 23, 2026. That same day, the parties entered a five-day exclusivity period."),
      p("From December 16 to December 20, the parties finalized definitive documentation. On December 20, after receiving fairness opinions from PJT Partners and JP Morgan in favor of the $24.55-per-share consideration, the special committee unanimously recommended approval, and the board approved the merger agreement and recommended it to stockholders. The company executed the merger agreement, debt-commitment letter, equity-commitment letters and fee-funding agreements on December 20 and announced the transaction on December 21."),
      p("On December 22, the company began a go-shop period running to January 23, 2026, contacting 44 potential bidders. Between December 27, 2025, and January 23, 2026, six parties executed NDAs, but each declined to submit a superior proposal, citing valuation concerns, financing constraints or strategic considerations. The go-shop expired on January 23, 2026, without any alternative takeover proposal."),
    ],
    commentary: [
      p("The merger agreement includes a go-shop period ending on January 23, 2026, subject to a potential 10-day extension."),
      p("Clearwater Analytics announced that its go-shop period expired on January 23 without receiving any alternative acquisition proposals."),
      p("Despite financial advisors soliciting interest from 44 potential suitors — including both financial sponsors and strategic parties — none of the six entities that accessed confidential data submitted a competing bid against Clearwater's existing merger agreement with a consortium of Permira and Warburg Pincus."),
    ],
    filings: [
      {
        _key: k(),
        jurisdiction: "HSR",
        outcome: "cleared",
        outcome_summary: "Early termination granted February 13, 2026.",
        steps: [
          { _key: k(), label: "HSR filed", actual_date: "2026-01-27" },
          { _key: k(), label: "Early termination granted", actual_date: "2026-02-13" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "EC_Merger",
        outcome: "pending",
        outcome_summary: "Notified as a super-simplified review on March 26. Phase I expires May 6 — coincides with the shareholder vote date. Super-simplified cases are routinely cleared well within Phase I.",
        case_url: "https://competition-cases.ec.europa.eu/cases/M.12339",
        steps: [
          { _key: k(), label: "EC notification (super-simplified)", actual_date: "2026-03-26" },
          { _key: k(), label: "Phase I decision (25 working days)", expected_date: "2026-05-06", note: "Coincides with shareholder vote" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "SAMR",
        outcome: "pending",
        outcome_summary: "Application filed in Q1 2026. Fintech/SaaS deals generally routine at SAMR but timing visibility is limited.",
        steps: [
          { _key: k(), label: "SAMR application filed", actual_date: "2026-03-15" },
          { _key: k(), label: "SAMR Phase I (30 days)", expected_date: "2026-04-15" },
          { _key: k(), label: "SAMR decision", expected_date: "2026-06-15" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "ACCC",
        outcome: "cleared",
        outcome_summary: "Waiver determination in Q1 — merger does not need to be notified.",
        steps: [
          { _key: k(), label: "ACCC waiver granted", actual_date: "2026-02-28" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "Turkey",
        outcome: "pending",
        outcome_summary: "Notification filed Q1 2026.",
        steps: [
          { _key: k(), label: "Turkish CA filing", actual_date: "2026-03-10" },
          { _key: k(), label: "Turkish CA decision", expected_date: "2026-05-15" },
        ],
      },
      {
        _key: k(),
        jurisdiction: "FIRB",
        outcome: "pending",
        outcome_summary: "Application submitted Q2 2026 given Temasek involvement. Statutory 30-day review period (extendable).",
        steps: [
          { _key: k(), label: "FIRB application submitted", expected_date: "2026-04-15" },
          { _key: k(), label: "FIRB decision (30 days, extendable)", expected_date: "2026-06-15" },
        ],
      },
    ],
    shareholder_votes: [{ party: "target",
      outcome: "pending",
      label: "Target shareholders — May 6, 2026 (requires majority + majority of disinterested under DGCL §144)",
      outcome_summary:
        "Virtual special meeting at 10:30 AM on May 6. Requires both a majority of all outstanding voting power AND a separate majority of disinterested stockholders (DGCL Section 144), given the buyer group's pre-existing ownership. Board unanimously recommends FOR. Record date: April 6, 2026 (298,388,859 shares).",
      steps: [
        { _key: k(), label: "Preliminary proxy filed", actual_date: "2026-02-24" },
        { _key: k(), label: "Definitive proxy filed", actual_date: "2026-04-09" },
        { _key: k(), label: "Consideration election deadline", expected_date: "2026-04-16" },
        { _key: k(), label: "Shareholder vote", expected_date: "2026-05-06", note: "Virtual meeting, 10:30 AM" },
      ],
    }],
    ctfn_probability: [
      p("Our 78% probability reflects a clean regulatory picture (HSR cleared, EC super-simplified, ACCC waived) with SAMR and FIRB as the only timing unknowns. The fintech SaaS profile is generally low-risk at SAMR compared to semiconductor or critical infrastructure deals."),
      p("Clearwater Analytics is a cloud-native SaaS platform for institutional investors, providing automated investment accounting, portfolio management, trading, reconciliation, regulatory reporting, performance, compliance, and risk analytics in one unified system. It processes and reconciles data on over $10 trillion in assets globally for more than 2,500 clients including insurers, asset managers, hedge funds, banks, corporations, and governments."),
      p("The company expanded significantly into front-office and risk capabilities through its 2025 acquisitions of Enfusion and Beacon. Q4 2025 results showed $217.5mn revenue (+72% YoY), $841mn full-year ARR (+77% YoY), 79.2% non-GAAP gross margin, and net revenue retention of 109%."),
      p("Permira and Warburg Pincus are not new to the company — both co-invested in a 2020 growth round alongside Welsh Carson and participated in the September 2021 IPO at $18/share. They are long-term backers returning to full control at $24.55, roughly 52% above the IPO equity valuation."),
      p("The conflicts-of-interest narrative is the primary litigation risk. The buyout was agreed less than two weeks after Starboard Value disclosed a 5% activist stake on December 9, 2025. Multiple plaintiff firms (Kaskela, Levi & Korsinsky, Scott+Scott) allege the insider buyers possessed MNPI about CWAN's growth trajectory and that the go-shop was procedurally insufficient. Between March 4-17, 2026, CWAN received four disclosure-deficiency demand letters and nine books-and-records demands under DGCL Section 220."),
      p("However, the 47% premium, clean go-shop outcome (44 bidders contacted, none competed), unanimous board/special committee recommendation, and dual fairness opinions from PJT Partners and JP Morgan provide a strong defense. At announcement, several analysts had price targets above $35 — but no strategic or financial buyer was willing to bid."),
    ],
    risk_factors: [
      p("SAMR timing: although fintech SaaS is lower-risk than semiconductor at SAMR, Chinese regulatory timelines remain unpredictable."),
      p("FIRB timing: Temasek (Singapore sovereign wealth) involvement triggers Australian foreign investment review."),
      p("Litigation / conflicts of interest: multiple plaintiff firms allege insider buyers possessed MNPI, process was insufficient, and go-shop was procedurally compromised. 4 disclosure-deficiency demands + 9 books-and-records demands received."),
      p("Disinterested-stockholder vote threshold (DGCL §144): requires separate majority of non-insider shares, adding vote complexity."),
      p("Starboard Value (5% activist) disclosed stake 12 days before deal announcement — timing raises process-independence questions."),
    ],
    shareholder_activism: [
      {
        _key: k(),
        date: "2025-12-09",
        actor: "Starboard Value (~5% stake)",
        stance: "critical",
        description:
          "Starboard Value disclosed a ~5% stake in CWAN and publicly called for the company to run a robust, independent sales process, citing undervaluation and integration concerns around the Enfusion and Beacon acquisitions. Just 12 days later, the definitive merger agreement with Permira/Warburg was announced.",
      },
      {
        _key: k(),
        date: "2026-03-17",
        actor: "Plaintiff law firms (Kaskela, Levi & Korsinsky, Scott+Scott)",
        stance: "critical",
        description:
          "Multiple plaintiff firms announced investigations alleging significant conflicts of interest, inadequate sale process, and undervaluation. CWAN received four disclosure-deficiency demand letters and nine books-and-records demand letters under DGCL Section 220 between March 4-17, 2026. Central allegation: insider buyers (Permira/Warburg) possessed MNPI about CWAN's growth trajectory and the go-shop was procedurally insufficient.",
      },
    ],
    documents: [
      { _key: k(), title: "Press Release (12/21/25)", url: "https://cwan.com/press-releases/clearwater-analytics-to-be-acquired-for-8-4-billion-by-permira-and-warburg-pincus-supported-by-francisco-partners-and-with-participation-from-temasek/" },
      { _key: k(), title: "Permira Announcement", url: "https://www.permira.com/news-and-insights/announcements/clearwater-analytics-to-be-acquired-for-84-billion-by-permira-and-warburg-pincus-supported-by-francisco-partners-and-with-participation-from-temasek" },
      { _key: k(), title: "European Commission Case Page", url: "https://competition-cases.ec.europa.eu/cases/M.12339" },
    ],
    trigger_alert: false,
    alert_summary: "Shareholder vote May 6; EC Phase I clearance expected same day. SAMR and FIRB pending.",
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
