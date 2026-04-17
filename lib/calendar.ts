import type { DealListItem, Filing, FilingStep, ShareholderVote } from "@/lib/sanity/types";
import { JURISDICTION_LABEL } from "@/lib/filings";

export interface CalendarEvent {
  date: string; // ISO date
  dealSlug: string;
  dealTarget: string;
  dealAcquirer: string;
  targetTicker?: string;
  sector: string;
  source: "filing" | "vote";
  regulator: string; // short label
  regulatorFull: string;
  label: string;
  isDone: boolean;
  note?: string;
}

const REGULATOR_SHORT: Record<string, string> = {
  HSR: "HSR",
  CFIUS: "CFIUS",
  STB: "STB",
  FCC: "FCC",
  State_AG: "State AG",
  EC_Merger: "EC",
  EC_FSR: "EC FSR",
  CMA: "CMA",
  CADE: "CADE",
  SAMR: "SAMR",
  CCB: "Canada",
  Turkey: "Turkey",
  BKartA: "Germany",
  CNA: "Mexico",
  Court: "Court",
  Other: "Other",
};

export function aggregateEvents(
  deals: (DealListItem & {
    filings?: Filing[];
    shareholder_votes?: ShareholderVote[];
  })[],
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const deal of deals) {
    // Filing steps
    for (const filing of deal.filings ?? []) {
      for (const step of filing.steps ?? []) {
        const date = step.actual_date || step.expected_date;
        if (!date) continue;
        events.push({
          date,
          dealSlug: deal.slug,
          dealTarget: deal.target,
          dealAcquirer: deal.acquirer,
          targetTicker: deal.target_ticker,
          sector: deal.sector,
          source: "filing",
          regulator:
            REGULATOR_SHORT[filing.jurisdiction] || filing.jurisdiction,
          regulatorFull:
            filing.display_name ||
            JURISDICTION_LABEL[filing.jurisdiction] ||
            filing.jurisdiction,
          label: step.label,
          isDone: !!step.actual_date,
          note: step.note,
        });
      }
    }

    // Vote steps
    for (const vote of deal.shareholder_votes ?? []) {
      for (const step of vote.steps ?? []) {
        const date = step.actual_date || step.expected_date;
        if (!date) continue;
        const party =
          vote.party === "acquirer"
            ? "Acquirer"
            : vote.party === "both"
              ? "Both"
              : "Target";
        events.push({
          date,
          dealSlug: deal.slug,
          dealTarget: deal.target,
          dealAcquirer: deal.acquirer,
          targetTicker: deal.target_ticker,
          sector: deal.sector,
          source: "vote",
          regulator: "Vote",
          regulatorFull: `${party} shareholder vote`,
          label: step.label,
          isDone: !!step.actual_date,
          note: step.note,
        });
      }
    }
  }

  events.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return events;
}

// Generate an .ics file content for a single calendar event
export function generateICS(event: CalendarEvent): string {
  const dateClean = event.date.replace(/-/g, "");
  const nextDay = new Date(event.date + "T00:00:00Z");
  nextDay.setDate(nextDay.getDate() + 1);
  const endDate = nextDay.toISOString().slice(0, 10).replace(/-/g, "");

  const summary = `${event.dealTarget} / ${event.dealAcquirer} — ${event.label}`;
  const description = [
    `Regulator: ${event.regulatorFull}`,
    event.note ? `Note: ${event.note}` : "",
    `Deal page: ${process.env.NEXT_PUBLIC_APP_URL || "https://research.ctfnlighthouse.com"}/deals/${event.dealSlug}`,
  ]
    .filter(Boolean)
    .join("\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CTFN Lighthouse//Active Sits//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART;VALUE=DATE:${dateClean}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${escapeICS(summary)}`,
    `DESCRIPTION:${escapeICS(description)}`,
    `UID:${event.dealSlug}-${dateClean}-${event.regulator}@ctfnlighthouse.com`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function escapeICS(s: string): string {
  return s.replace(/[,;\\]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
}
