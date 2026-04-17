import { defineField, defineType } from "sanity";
import { richTextBlock, richTextWithImages } from "./richText";

export const deal = defineType({
  name: "deal",
  title: "Deal",
  type: "document",
  groups: [
    { name: "identity", title: "Identity" },
    { name: "economics", title: "Economics" },
    { name: "ctfn", title: "CTFN" },
    { name: "regulatory", title: "Regulatory" },
    { name: "content", title: "Content" },
    { name: "docs", title: "Documents & Advisors" },
    { name: "alerts", title: "Alerts" },
  ],
  fields: [
    // ── Identity ────────────────────────────────────────────────
    defineField({
      name: "acquirer",
      title: "Acquirer",
      type: "string",
      group: "identity",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "target",
      title: "Target",
      type: "string",
      group: "identity",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "acquirer_ticker",
      title: "Acquirer Ticker (e.g. \"PSKY\")",
      type: "string",
      group: "identity",
    }),
    defineField({
      name: "target_ticker",
      title: "Target Ticker (e.g. \"WBD\")",
      type: "string",
      group: "identity",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "identity",
      options: {
        source: (doc: Record<string, unknown>) =>
          `${(doc.acquirer as string) ?? ""}-${(doc.target as string) ?? ""}`,
        maxLength: 96,
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "status",
      title: "Deal Status",
      type: "string",
      group: "identity",
      options: {
        list: [
          { title: "Pre-event", value: "pre_event" },
          { title: "Ongoing", value: "ongoing" },
          { title: "Closed", value: "closed" },
          { title: "Terminated", value: "terminated" },
        ],
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "sector",
      title: "Sector",
      type: "string",
      group: "identity",
      options: {
        list: [
          "technology",
          "healthcare",
          "financial_services",
          "energy",
          "consumer",
          "industrials",
          "media_telecom",
          "other",
        ],
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "target_jurisdiction",
      title: "Target Jurisdiction",
      type: "string",
      group: "identity",
    }),

    // ── Deck / Key risk summary ─────────────────────────────────
    defineField({
      name: "deck",
      title: "Article Deck (short summary shown under title)",
      type: "text",
      rows: 2,
      group: "content",
    }),
    defineField({
      name: "key_risk_summary",
      title: "Key Risk Summary (pullquote)",
      type: "text",
      rows: 3,
      group: "content",
    }),

    // ── Deal Economics ──────────────────────────────────────────
    defineField({
      name: "equity_value",
      title: "Implied Equity Value (USD millions)",
      type: "number",
      group: "economics",
    }),
    defineField({
      name: "shares_outstanding",
      title: "Shares Outstanding (millions)",
      type: "number",
      group: "economics",
    }),
    defineField({
      name: "offer_price",
      title: "Offer Price (USD per share)",
      type: "number",
      group: "economics",
    }),
    defineField({
      name: "offer_terms",
      title: "Offer Terms (prose — e.g. \"$31 cash + $0.25/qtr ticking fee\")",
      type: "string",
      group: "economics",
    }),
    defineField({
      name: "premium",
      title: "Premium (%)",
      type: "number",
      group: "economics",
    }),
    defineField({
      name: "premium_reference",
      title: "Premium reference (e.g. \"vs Sep 10 close\")",
      type: "string",
      group: "economics",
    }),
    defineField({
      name: "termination_fee",
      title: "Termination Fee (USD millions)",
      type: "number",
      group: "economics",
    }),
    defineField({
      name: "termination_fee_pct",
      title: "Termination Fee (%)",
      type: "number",
      group: "economics",
    }),
    defineField({
      name: "reverse_termination_fee",
      title: "Reverse Termination Fee (USD millions)",
      type: "number",
      group: "economics",
    }),
    defineField({
      name: "reverse_termination_fee_pct",
      title: "Reverse Termination Fee (%)",
      type: "number",
      group: "economics",
    }),
    defineField({
      name: "termination_fee_notes",
      title: "Termination Fee Notes",
      type: "text",
      group: "economics",
    }),
    defineField({
      name: "financing",
      title: "Financing",
      type: "text",
      group: "economics",
    }),

    // ── CTFN Proprietary ────────────────────────────────────────
    defineField({
      name: "ctfn_closing_probability",
      title: "CTFN Closing Probability (0–100)",
      type: "number",
      group: "ctfn",
      validation: (R) => R.min(0).max(100),
    }),
    defineField({
      name: "ctfn_estimated_close",
      title: "CTFN Estimated Close Date",
      type: "date",
      group: "ctfn",
    }),
    defineField({
      name: "ctfn_probability_notes",
      title: "Probability Notes (internal)",
      type: "text",
      group: "ctfn",
    }),

    // ── Dates ───────────────────────────────────────────────────
    defineField({
      name: "announcement_date",
      title: "Announcement Date",
      type: "date",
      group: "ctfn",
    }),
    defineField({
      name: "published_date",
      title: "Article Published Date",
      type: "date",
      group: "ctfn",
    }),
    defineField({
      name: "next_key_event_date",
      title: "Next Key Event Date",
      type: "date",
      group: "ctfn",
    }),
    defineField({
      name: "next_key_event_label",
      title: "Next Key Event Label",
      type: "string",
      group: "ctfn",
    }),
    defineField({
      name: "outside_date",
      title: "Outside Date (initial)",
      type: "date",
      group: "ctfn",
    }),
    defineField({
      name: "outside_date_final",
      title: "Outside Date — maximum with extensions",
      type: "date",
      group: "ctfn",
      description:
        "Latest possible outside date if all permitted extensions are exercised. Leave blank if there's no extension provision.",
    }),
    defineField({
      name: "outside_date_notes",
      title: "Extension terms",
      type: "string",
      group: "ctfn",
      description:
        'e.g. "Automatic 3-month extension if regulatory approvals pending" or "Four 3-month extensions available".',
    }),
    defineField({
      name: "closing_guidance",
      title: "Closing Guidance (prose e.g. \"Q3 2026\")",
      type: "string",
      group: "ctfn",
    }),

    // ── Regulatory Filings ──────────────────────────────────────
    // Each filing is one regulator's lifecycle. A filing has:
    //   - a current outcome (pending, cleared, …)
    //   - an ordered steps[] array. Each step has expected_date + actual_date;
    //     completion and "next up" are derived.
    defineField({
      name: "filings",
      title: "Regulatory Filings",
      type: "array",
      group: "regulatory",
      of: [
        {
          type: "object",
          name: "filing",
          fields: [
            {
              name: "jurisdiction",
              type: "string",
              title: "Jurisdiction",
              options: {
                list: [
                  { title: "US — FTC / DOJ (HSR)", value: "HSR" },
                  { title: "US — CFIUS", value: "CFIUS" },
                  { title: "US — STB", value: "STB" },
                  { title: "US — FCC", value: "FCC" },
                  { title: "US — State AG", value: "State_AG" },
                  { title: "EU — European Commission (merger control)", value: "EC_Merger" },
                  { title: "EU — European Commission (FSR)", value: "EC_FSR" },
                  { title: "UK — CMA", value: "CMA" },
                  { title: "Brazil — CADE", value: "CADE" },
                  { title: "China — SAMR", value: "SAMR" },
                  { title: "Canada — Competition Bureau", value: "CCB" },
                  { title: "Turkey — Competition Authority", value: "Turkey" },
                  { title: "Germany — BKartA", value: "BKartA" },
                  { title: "Mexico — CNA", value: "CNA" },
                  { title: "Court / Litigation", value: "Court" },
                  { title: "Other", value: "Other" },
                ],
              },
              validation: (R) => R.required(),
            },
            {
              name: "display_name",
              type: "string",
              title: "Display name (optional override)",
              description: "e.g. \"EU Foreign Subsidies Regulation\" — blank uses the default name.",
            },
            {
              name: "outcome",
              type: "string",
              title: "Current outcome",
              options: {
                list: [
                  { title: "Pending", value: "pending" },
                  { title: "Cleared", value: "cleared" },
                  { title: "Cleared with remedies", value: "cleared_with_remedies" },
                  { title: "Conditional / Under investigation", value: "conditional" },
                  { title: "Blocked", value: "blocked" },
                  { title: "Withdrawn", value: "withdrawn" },
                ],
              },
              initialValue: "pending",
              validation: (R) => R.required(),
            },
            {
              name: "outcome_summary",
              type: "text",
              rows: 2,
              title: "Outcome summary / notes",
              description: "Describe remedies, pending theories of harm, etc.",
            },
            {
              name: "case_url",
              type: "url",
              title: "Case page URL (optional)",
              description:
                "Link to the regulator's dedicated case page (e.g. EC competition case, CMA inquiry page, STB docket). Leave blank if none exists.",
            },
            {
              name: "steps",
              type: "array",
              title: "Lifecycle steps",
              of: [
                {
                  type: "object",
                  name: "filing_step",
                  fields: [
                    {
                      name: "label",
                      type: "string",
                      title: "Step label",
                      description:
                        "e.g. \"Notification filed\", \"Phase I decision\", \"Second request issued\".",
                      validation: (R) => R.required(),
                    },
                    {
                      name: "expected_date",
                      type: "date",
                      title: "Expected date",
                    },
                    {
                      name: "actual_date",
                      type: "date",
                      title: "Actual / occurred date",
                      description:
                        "Leave blank until the step actually occurs. Presence = step completed.",
                    },
                    {
                      name: "note",
                      type: "text",
                      rows: 2,
                      title: "Note (optional)",
                    },
                  ],
                  preview: {
                    select: {
                      title: "label",
                      actual: "actual_date",
                      expected: "expected_date",
                    },
                    prepare({ title, actual, expected }) {
                      const suffix = actual
                        ? `· done ${actual}`
                        : expected
                          ? `· exp ${expected}`
                          : "";
                      return { title, subtitle: suffix };
                    },
                  },
                },
              ],
            },
          ],
          preview: {
            select: {
              jur: "jurisdiction",
              display: "display_name",
              outcome: "outcome",
            },
            prepare({ jur, display, outcome }) {
              return {
                title: display || jur || "Filing",
                subtitle: outcome ?? "pending",
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "best_efforts",
      title: "Best Efforts Standard",
      type: "text",
      rows: 3,
      group: "regulatory",
    }),
    // ── Shareholder Votes (array — supports target + acquirer separately) ──
    defineField({
      name: "shareholder_votes",
      title: "Shareholder Votes",
      type: "array",
      group: "regulatory",
      of: [
        {
          type: "object",
          name: "vote_entry",
          fields: [
            {
              name: "party",
              type: "string",
              title: "Voting party",
              options: {
                list: [
                  { title: "Target shareholders", value: "target" },
                  { title: "Acquirer shareholders", value: "acquirer" },
                  { title: "Both (joint meeting)", value: "both" },
                ],
              },
              validation: (R) => R.required(),
            },
            {
              name: "outcome",
              type: "string",
              title: "Outcome",
              options: {
                list: [
                  { title: "Pending", value: "pending" },
                  { title: "Approved", value: "approved" },
                  { title: "Rejected", value: "rejected" },
                  { title: "Postponed", value: "postponed" },
                  { title: "Not required", value: "not_required" },
                ],
              },
              initialValue: "pending",
            },
            {
              name: "label",
              type: "string",
              title: "Label (e.g. \"Simple majority required\")",
            },
            {
              name: "outcome_summary",
              type: "text",
              rows: 2,
              title: "Notes / recommendations (ISS, Glass Lewis, etc.)",
            },
            {
              name: "committed_pct",
              type: "number",
              title: "Voting agreements — % committed (optional)",
              validation: (R) => R.min(0).max(100),
            },
            {
              name: "committed_notes",
              type: "string",
              title: "Voting agreements — who signed (optional)",
            },
            {
              name: "steps",
              type: "array",
              title: "Vote lifecycle",
              of: [
                {
                  type: "object",
                  name: "vote_step",
                  fields: [
                    {
                      name: "label",
                      type: "string",
                      title: "Step",
                      validation: (R) => R.required(),
                    },
                    { name: "expected_date", type: "date", title: "Expected" },
                    { name: "actual_date", type: "date", title: "Actual" },
                    { name: "note", type: "text", rows: 2, title: "Note" },
                  ],
                },
              ],
            },
          ],
          preview: {
            select: { party: "party", outcome: "outcome" },
            prepare({ party, outcome }: { party?: string; outcome?: string }) {
              const labels: Record<string, string> = { target: "Target", acquirer: "Acquirer", both: "Both" };
              return { title: `${labels[party ?? ""] ?? party} shareholders`, subtitle: outcome ?? "pending" };
            },
          },
        },
      ],
    }),

    // ── Content (free + paid) ───────────────────────────────────
    defineField({
      name: "free_preview",
      title: "Free Preview",
      type: "array",
      group: "content",
      of: [richTextBlock],
    }),
    defineField({
      name: "background",
      title: "Background (deal history, bid chronology)",
      type: "array",
      group: "content",
      of: [richTextBlock],
    }),
    defineField({
      name: "commentary",
      title: "CTFN Commentary",
      type: "array",
      group: "content",
      of: [richTextBlock],
    }),
    // ── CTFN Analysis (structured sub-sections) ──────────────
    // Each sub-section is an independent rich-text field with image support.
    // Empty sub-sections are hidden on the frontend.
    defineField({
      name: "ctfn_probability",
      title: "CTFN Probability Assessment",
      type: "array",
      group: "content",
      of: richTextWithImages,
      description: "CTFN's closing probability narrative and key risk assessment.",
    }),
    defineField({
      name: "ctfn_target_company",
      title: "Target Company",
      type: "array",
      group: "content",
      of: richTextWithImages,
      description: "Target company description, business segments, products.",
    }),
    defineField({
      name: "ctfn_acquirer_company",
      title: "Acquirer Company",
      type: "array",
      group: "content",
      of: richTextWithImages,
      description: "Acquirer company description, business segments, products.",
    }),
    defineField({
      name: "ctfn_overlaps",
      title: "Overlaps",
      type: "array",
      group: "content",
      of: richTextWithImages,
      description: "Competitive overlap analysis between the merging parties.",
    }),
    defineField({
      name: "ctfn_rationale_synergies",
      title: "Rationale & Synergies",
      type: "array",
      group: "content",
      of: richTextWithImages,
      description: "Strategic rationale, expected synergies, value creation thesis.",
    }),
    defineField({
      name: "ctfn_competition",
      title: "Competition",
      type: "array",
      group: "content",
      of: richTextWithImages,
      description: "Competitive landscape for both companies.",
    }),
    defineField({
      name: "ctfn_customers",
      title: "Customers",
      type: "array",
      group: "content",
      of: richTextWithImages,
      description: "Key customer relationships, concentration, revenue split.",
    }),
    defineField({
      name: "ctfn_precedent_transactions",
      title: "Precedent Transactions",
      type: "array",
      group: "content",
      of: richTextWithImages,
      description: "Relevant precedent M&A transactions in the sector.",
    }),
    defineField({
      name: "risk_factors",
      title: "Risk Factors",
      type: "array",
      group: "content",
      of: [richTextBlock],
    }),

    // ── Shareholder / Stakeholder Activism ─────────────────────
    // Chronological list of positions taken by shareholders, labor, trade
    // groups, competitors, lawmakers, etc. Optional — most small deals will
    // leave this blank.
    defineField({
      name: "shareholder_activism",
      title: "Shareholder / Stakeholder Activism",
      type: "array",
      group: "content",
      of: [
        {
          type: "object",
          name: "activism_entry",
          fields: [
            {
              name: "date",
              type: "date",
              title: "Date",
              validation: (R) => R.required(),
            },
            {
              name: "actor",
              type: "string",
              title: "Actor (e.g. \"Teamsters\", \"BNSF\", \"Sen. Warren\")",
              validation: (R) => R.required(),
            },
            {
              name: "stance",
              type: "string",
              title: "Stance",
              options: {
                list: [
                  { title: "Supportive", value: "supportive" },
                  { title: "Opposed", value: "opposed" },
                  { title: "Critical", value: "critical" },
                  { title: "Neutral / observing", value: "neutral" },
                ],
              },
              initialValue: "critical",
            },
            {
              name: "description",
              type: "text",
              rows: 4,
              title: "Description (3–4 lines)",
              validation: (R) => R.required(),
            },
            {
              name: "source_url",
              type: "url",
              title: "Source URL (optional)",
            },
          ],
          preview: {
            select: {
              date: "date",
              actor: "actor",
              stance: "stance",
            },
            prepare({ date, actor, stance }) {
              return {
                title: `${actor ?? "Actor"} · ${stance ?? "—"}`,
                subtitle: date ?? "",
              };
            },
          },
        },
      ],
    }),

    // ── Advisors ────────────────────────────────────────────────
    defineField({
      name: "target_advisors",
      title: "Target Advisors",
      type: "text",
      rows: 3,
      group: "docs",
    }),
    defineField({
      name: "acquirer_advisors",
      title: "Acquirer Advisors",
      type: "text",
      rows: 3,
      group: "docs",
    }),

    // ── Documents ───────────────────────────────────────────────
    defineField({
      name: "documents",
      title: "Deal Documents",
      type: "array",
      group: "docs",
      of: [
        {
          type: "object",
          name: "deal_document",
          fields: [
            {
              name: "title",
              type: "string",
              title: "Title",
              validation: (R) => R.required(),
            },
            {
              name: "url",
              type: "url",
              title: "URL",
              validation: (R) => R.required(),
            },
          ],
          preview: { select: { title: "title", subtitle: "url" } },
        },
      ],
    }),

    // ── Single-report purchase ────────────────────────────────
    defineField({
      name: "allow_single_purchase",
      title: "Available for single-report purchase",
      type: "boolean",
      group: "alerts",
      initialValue: false,
      description:
        "When enabled, readers can buy access to this deal for a one-time fee instead of subscribing.",
    }),
    defineField({
      name: "single_purchase_price",
      title: "Single report price (USD)",
      type: "number",
      group: "alerts",
      initialValue: 99,
      description: "Default is $89. Change per deal if needed.",
      hidden: ({ parent }) => !parent?.allow_single_purchase,
    }),
    defineField({
      name: "last_material_update",
      title: "Last material update",
      type: "datetime",
      group: "alerts",
      description:
        "Set this to now when publishing a material update. Single-report buyers who purchased before this timestamp will be re-locked and prompted to subscribe. Auto-set by the alerts webhook when 'Send Watchlist Alert' is ticked.",
    }),

    // ── Alert controls ──────────────────────────────────────────
    defineField({
      name: "trigger_alert",
      title: "Send Watchlist Alert on Publish",
      type: "boolean",
      group: "alerts",
      initialValue: false,
    }),
    defineField({
      name: "alert_summary",
      title: "Alert Email Summary (max 280 chars)",
      type: "string",
      group: "alerts",
      validation: (R) => R.max(280),
    }),
  ],
  preview: {
    select: { title: "acquirer", subtitle: "target", status: "status" },
    prepare({
      title,
      subtitle,
      status,
    }: {
      title?: string;
      subtitle?: string;
      status?: string;
    }) {
      return {
        title: `${subtitle ?? ""} / ${title ?? ""}`,
        subtitle: status ?? "",
      };
    },
  },
});
