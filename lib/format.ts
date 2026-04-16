import type { DealStatus } from "@/lib/sanity/types";

// For the tag-pill / badge background — editorial palette.
export const STAGE_COLORS: Record<DealStatus, string> = {
  announced: "bg-blue-50 text-blue-800 border border-blue-200",
  regulatory_review:
    "bg-brand-gold-light text-brand-gold-ink border border-brand-gold/40",
  hsr_waiting:
    "bg-brand-gold-light text-brand-gold-ink border border-brand-gold/40",
  proxy_filed: "bg-indigo-50 text-indigo-800 border border-indigo-200",
  vote_scheduled: "bg-indigo-50 text-indigo-800 border border-indigo-200",
  closing_imminent: "bg-green-50 text-green-800 border border-green-200",
  closed: "bg-gray-100 text-gray-600 border border-gray-300",
  terminated: "bg-red-50 text-red-800 border border-red-200",
  archived: "bg-gray-50 text-gray-400 border border-gray-200",
};

export const STAGE_LABEL: Record<DealStatus, string> = {
  announced: "Announced",
  regulatory_review: "Regulatory Review",
  hsr_waiting: "HSR Waiting",
  proxy_filed: "Proxy Filed",
  vote_scheduled: "Vote Scheduled",
  closing_imminent: "Closing Imminent",
  closed: "Closed",
  terminated: "Terminated",
  archived: "Archived",
};

export function formatUSDM(value?: number): string {
  if (value == null) return "—";
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}bn`;
  return `$${value.toLocaleString()}mn`;
}

export function formatPrice(value?: number): string {
  if (value == null) return "—";
  return `$${value.toFixed(2)}`;
}

export function formatPercent(value?: number): string {
  if (value == null) return "—";
  return `${value.toFixed(0)}%`;
}

export function formatDate(value?: string): string {
  if (!value) return "—";
  return new Date(value + (value.length === 10 ? "T00:00:00Z" : "")).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    },
  );
}

export function daysUntil(value?: string): number | null {
  if (!value) return null;
  const ms =
    new Date(value + (value.length === 10 ? "T00:00:00Z" : "")).getTime() -
    Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export const SECTOR_LABEL: Record<string, string> = {
  technology: "Technology",
  healthcare: "Healthcare",
  financial_services: "Financial Services",
  energy: "Energy",
  consumer: "Consumer",
  industrials: "Industrials",
  media_telecom: "Media & Telecom",
  other: "Other",
};

export function formatTickers(
  acquirer?: string,
  target?: string,
): string | undefined {
  const a = acquirer?.trim();
  const t = target?.trim();
  if (a && t) return `${a} / ${t}`;
  return a || t;
}

export function formatSector(s?: string): string {
  if (!s) return "";
  return (
    SECTOR_LABEL[s] ||
    s
      .split("_")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ")
  );
}
