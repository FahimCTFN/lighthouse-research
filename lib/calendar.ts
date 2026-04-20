import type { DealListItem, Filing, FilingStep, ShareholderVote } from "@/lib/sanity/types";
import { JURISDICTION_LABEL } from "@/lib/filings";
import { REGULATOR_SHORT } from "@/lib/regulators";

export interface CalendarEvent {
  date: string; // ISO date
  dealSlug: string;
  dealTarget: string;
  dealAcquirer: string;
  targetTicker?: string;
  sector: string;
  source: "filing" | "vote" | "deal";
  regulator: string; // short label
  regulatorFull: string;
  label: string;
  isDone: boolean;
  note?: string;
}

interface DealWithEvents extends DealListItem {
  filings?: Filing[];
  shareholder_votes?: ShareholderVote[];
  outside_date?: string;
  outside_date_final?: string;
  ctfn_estimated_close?: string;
  announcement_date?: string;
  next_key_event_date?: string;
  next_key_event_label?: string;
}

export function aggregateEvents(deals: DealWithEvents[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const deal of deals) {
    const base = {
      dealSlug: deal.slug,
      dealTarget: deal.target,
      dealAcquirer: deal.acquirer,
      targetTicker: deal.target_ticker,
      sector: deal.sector,
    };

    // Filing steps
    for (const filing of deal.filings ?? []) {
      for (const step of filing.steps ?? []) {
        const date = step.actual_date || step.expected_date;
        if (!date) continue;
        events.push({
          ...base,
          date,
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
          ...base,
          date,
          source: "vote",
          regulator: "Vote",
          regulatorFull: `${party} shareholder vote`,
          label: step.label,
          isDone: !!step.actual_date,
          note: step.note,
        });
      }
    }

    // Deal-level dates
    if (deal.outside_date) {
      events.push({
        ...base,
        date: deal.outside_date,
        source: "deal",
        regulator: "Deadline",
        regulatorFull: "Outside date",
        label: "Outside date (initial)",
        isDone: false,
      });
    }
    if (deal.outside_date_final && deal.outside_date_final !== deal.outside_date) {
      events.push({
        ...base,
        date: deal.outside_date_final,
        source: "deal",
        regulator: "Deadline",
        regulatorFull: "Outside date (final extension)",
        label: "Outside date (final extension)",
        isDone: false,
      });
    }
    if (deal.ctfn_estimated_close) {
      events.push({
        ...base,
        date: deal.ctfn_estimated_close,
        source: "deal",
        regulator: "CTFN",
        regulatorFull: "CTFN closing estimate",
        label: "CTFN estimated close",
        isDone: false,
      });
    }
    if (deal.next_key_event_date) {
      events.push({
        ...base,
        date: deal.next_key_event_date,
        source: "deal",
        regulator: "Key event",
        regulatorFull: "Next key event",
        label: deal.next_key_event_label || "Key event",
        isDone: false,
      });
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

// Google Calendar URL — opens in new tab with event pre-filled
export function googleCalendarUrl(event: CalendarEvent): string {
  const dateClean = event.date.replace(/-/g, "");
  const nextDay = new Date(event.date + "T00:00:00Z");
  nextDay.setDate(nextDay.getDate() + 1);
  const endDate = nextDay.toISOString().slice(0, 10).replace(/-/g, "");

  const title = `${event.dealTarget} / ${event.dealAcquirer} — ${event.label}`;
  const details = [
    `Regulator: ${event.regulatorFull}`,
    event.note ? `Note: ${event.note}` : "",
    "",
    `View deal: ${process.env.NEXT_PUBLIC_APP_URL || "https://research.ctfnlighthouse.com"}/deals/${event.dealSlug}`,
  ]
    .filter(Boolean)
    .join("\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${dateClean}/${endDate}`,
    details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Outlook Web URL — opens in new tab with event pre-filled
export function outlookCalendarUrl(event: CalendarEvent): string {
  const title = `${event.dealTarget} / ${event.dealAcquirer} — ${event.label}`;
  const body = [
    `Regulator: ${event.regulatorFull}`,
    event.note ? `Note: ${event.note}` : "",
    "",
    `View deal: ${process.env.NEXT_PUBLIC_APP_URL || "https://research.ctfnlighthouse.com"}/deals/${event.dealSlug}`,
  ]
    .filter(Boolean)
    .join("\n");

  const params = new URLSearchParams({
    subject: title,
    startdt: event.date,
    enddt: event.date,
    body,
    path: "/calendar/action/compose",
  });
  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
}
