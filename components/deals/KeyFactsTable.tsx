import type { ReactNode } from "react";
import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "@portabletext/react";
import { formatDate } from "@/lib/format";
import type {
  PaidDeal,
  ShareholderVote,
  ShareholderVoteOutcome,
} from "@/lib/sanity/types";

interface GridCell {
  label: string;
  value: string;
  sub?: string;
}

interface ProseRow {
  label: string;
  content: ReactNode; // rendered value (string or JSX)
}

const portableComponents: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href: string = value?.href || "#";
      const newTab: boolean = value?.newTab ?? true;
      return (
        <a
          href={href}
          target={newTab ? "_blank" : undefined}
          rel={newTab ? "noreferrer" : undefined}
        >
          {children}
        </a>
      );
    },
  },
};

export function KeyFactsTable({ deal }: { deal: PaidDeal }) {
  // Top grid: always 4 cells for visual consistency across deals.
  const cells: GridCell[] = [
    { label: "Announced", value: formatDate(deal.announcement_date) },
    {
      label: "Shareholder vote",
      value: summarizeShareholderVotes(deal.shareholder_votes),
    },
    {
      label: "Outside date",
      value: formatDate(deal.outside_date),
      sub:
        deal.outside_date_final && deal.outside_date_final !== deal.outside_date
          ? `extends to ${formatDate(deal.outside_date_final)}`
          : undefined,
    },
    {
      label: "Closing guidance",
      value: deal.closing_guidance || "—",
    },
  ];

  // Prose rows: only render when the editor has actually provided content.
  const rawProse: Array<{ label: string; value?: string }> = [
    { label: "Target jurisdiction", value: deal.target_jurisdiction },
    { label: "Financing", value: deal.financing },
    { label: "Best efforts", value: deal.best_efforts },
    { label: "Target advisors", value: deal.target_advisors },
    { label: "Acquirer advisors", value: deal.acquirer_advisors },
  ];
  const prose: ProseRow[] = rawProse
    .filter(
      (r): r is { label: string; value: string } =>
        !!r.value && r.value.trim().length > 0,
    )
    .map((r) => ({ label: r.label, content: r.value }));

  // Commentary (rich text) — append as a prose row only if present.
  if (hasProseContent(deal.commentary)) {
    prose.push({
      label: "Commentary",
      content: (
        <div className="space-y-2 leading-[1.65]">
          <PortableText
            value={deal.commentary!}
            components={portableComponents}
          />
        </div>
      ),
    });
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <header className="border-b border-gray-100 px-5 py-3">
        <h2 className="text-[11px] font-medium uppercase tracking-label text-gray-500">
          Key Facts
        </h2>
      </header>

      <dl className="grid grid-cols-2 gap-px bg-gray-100 sm:grid-cols-4">
        {cells.map((c) => (
          <div key={c.label} className="bg-white p-4">
            <dt className="text-[10px] font-medium uppercase tracking-label text-gray-500">
              {c.label}
            </dt>
            <dd className="mt-1 text-[15px] font-semibold tabular-nums text-brand-navy">
              {c.value}
            </dd>
            {c.sub && (
              <div className="mt-1 text-[11px] tabular-nums text-brand-gold-ink">
                {c.sub}
              </div>
            )}
          </div>
        ))}
      </dl>

      {prose.length > 0 && (
        <dl className="divide-y divide-gray-100 border-t border-gray-200">
          {prose.map((r) => (
            <div key={r.label} className="px-5 py-3">
              <dt className="text-[10px] font-medium uppercase tracking-label text-gray-500">
                {r.label}
              </dt>
              <dd className="mt-1.5 text-[13px] leading-[1.6] text-ink">
                {r.content}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

function hasProseContent(blocks?: PortableTextBlock[]): boolean {
  if (!blocks?.length) return false;
  // Treat the field as present only if at least one block has text.
  return blocks.some((b) => {
    if (b._type !== "block") return true; // e.g. embeds
    const children = (b as { children?: { text?: string }[] }).children ?? [];
    return children.some((c) => (c.text ?? "").trim().length > 0);
  });
}

const OUTCOME_SHORT: Record<ShareholderVoteOutcome, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  postponed: "Postponed",
  not_required: "Not required",
};

function summarizeShareholderVotes(votes?: ShareholderVote[]): string {
  if (!votes?.length) return "—";
  return votes
    .map((vote) => {
      const outcome = vote.outcome ?? "pending";
      const party =
        vote.party === "acquirer"
          ? "Acquirer"
          : vote.party === "both"
            ? "Both"
            : "Target";

      if (outcome === "not_required") return `${party}: N/A`;

      if (outcome === "approved" || outcome === "rejected") {
        const lastDone = [...(vote.steps ?? [])]
          .reverse()
          .find((s) => s.actual_date);
        const date = lastDone?.actual_date
          ? ` · ${formatDate(lastDone.actual_date)}`
          : "";
        return `${party} · ${OUTCOME_SHORT[outcome]}${date}`;
      }

      const next = (vote.steps ?? []).find(
        (s) => !s.actual_date && s.expected_date,
      );
      const date = next?.expected_date
        ? ` · ${formatDate(next.expected_date)}`
        : "";
      return `${party} · ${OUTCOME_SHORT[outcome]}${date}`;
    })
    .join(" | ");
}
