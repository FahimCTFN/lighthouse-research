// Derive a deal's "next key event" from its filings/vote steps so the
// snapshot card auto-advances when an event passes — no manual editor
// intervention required.
//
// Order of preference:
//   1. The earliest pending step (no actual_date, expected_date >= today)
//      across all non-completed filings and shareholder votes.
//   2. The deal's stored `next_key_event_*` fields, if their date is
//      still in the future.
//   3. `ctfn_estimated_close` as a "Closing target" fallback.
//   4. null.

import { REGULATOR_SHORT } from "@/lib/regulators";
import type { Filing, ShareholderVote } from "@/lib/sanity/types";

export interface NextEvent {
  date: string;
  label: string;
}

interface DealLike {
  filings?: Filing[];
  shareholder_votes?: ShareholderVote[];
  next_key_event_date?: string;
  next_key_event_label?: string;
  ctfn_estimated_close?: string;
}

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

function todayISO(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function isFuture(date: string | undefined, today: string): boolean {
  return !!date && date >= today;
}

function regulatorShort(jurisdiction: string, displayName?: string): string {
  if (displayName) return displayName;
  return REGULATOR_SHORT[jurisdiction] ?? jurisdiction;
}

export function deriveNextKeyEvent(deal: DealLike): NextEvent | null {
  const today = todayISO();
  const candidates: NextEvent[] = [];

  for (const f of deal.filings ?? []) {
    if (COMPLETED_FILING_OUTCOMES.has(f.outcome)) continue;
    for (const s of f.steps ?? []) {
      if (s.actual_date) continue;
      if (!isFuture(s.expected_date, today)) continue;
      candidates.push({
        date: s.expected_date!,
        label: `${regulatorShort(f.jurisdiction, f.display_name)} — ${s.label}`,
      });
    }
  }

  for (const v of deal.shareholder_votes ?? []) {
    if (v.outcome && COMPLETED_VOTE_OUTCOMES.has(v.outcome)) continue;
    for (const s of v.steps ?? []) {
      if (s.actual_date) continue;
      if (!isFuture(s.expected_date, today)) continue;
      candidates.push({
        date: s.expected_date!,
        label: s.label,
      });
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => a.date.localeCompare(b.date));
    return candidates[0];
  }

  if (
    deal.next_key_event_date &&
    deal.next_key_event_label &&
    isFuture(deal.next_key_event_date, today)
  ) {
    return {
      date: deal.next_key_event_date,
      label: deal.next_key_event_label,
    };
  }

  if (isFuture(deal.ctfn_estimated_close, today)) {
    return {
      date: deal.ctfn_estimated_close!,
      label: "Estimated close",
    };
  }

  return null;
}

// For the index/list views (where filings aren't fetched), fall back to
// stored fields with the closing-date safety net.
export function nextEventFromStored(deal: DealLike): NextEvent | null {
  const today = todayISO();
  if (
    deal.next_key_event_date &&
    deal.next_key_event_label &&
    isFuture(deal.next_key_event_date, today)
  ) {
    return {
      date: deal.next_key_event_date,
      label: deal.next_key_event_label,
    };
  }
  if (isFuture(deal.ctfn_estimated_close, today)) {
    return {
      date: deal.ctfn_estimated_close!,
      label: "Estimated close",
    };
  }
  return null;
}
