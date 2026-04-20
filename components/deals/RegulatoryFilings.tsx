"use client";

import { useMemo, useState } from "react";
import { formatDate, daysUntil } from "@/lib/format";
import {
  JURISDICTION_LABEL,
  OUTCOME_BADGE,
  OUTCOME_LABEL,
  annotateSteps,
  effectiveDate,
  filingDisplayName,
  type StepStatus,
} from "@/lib/filings";
import { REGULATOR_SHORT } from "@/lib/regulators";
import type { Filing, FilingStep } from "@/lib/sanity/types";

export function RegulatoryFilings({ filings }: { filings?: Filing[] }) {
  const [view, setView] = useState<"cards" | "timeline">("cards");
  if (!filings?.length) return null;

  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <header className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
        <h2 className="text-[11px] font-medium uppercase tracking-label text-gray-500">
          Regulatory Filings
        </h2>
        <div className="flex overflow-hidden rounded border border-gray-200 text-[11px]">
          <button
            onClick={() => setView("cards")}
            className={`px-2.5 py-1 ${
              view === "cards"
                ? "bg-brand-navy text-white"
                : "bg-white text-gray-600"
            }`}
          >
            By regulator
          </button>
          <button
            onClick={() => setView("timeline")}
            className={`border-l border-gray-200 px-2.5 py-1 ${
              view === "timeline"
                ? "bg-brand-navy text-white"
                : "bg-white text-gray-600"
            }`}
          >
            Timeline
          </button>
        </div>
      </header>

      {view === "cards" ? (
        <div className="grid grid-cols-1 gap-px bg-gray-100 sm:grid-cols-2">
          {filings.map((f) => (
            <FilingCard key={f._key ?? f.jurisdiction} filing={f} />
          ))}
        </div>
      ) : (
        <MergedTimeline filings={filings} />
      )}
    </section>
  );
}

function FilingCard({ filing }: { filing: Filing }) {
  const steps = annotateSteps(filing.steps);
  const doneCount = steps.filter((s) => s.status === "done").length;
  const nextStep = steps.find(
    (s) => s.status === "next" || s.status === "overdue",
  );
  const days = nextStep?.expected_date
    ? daysUntil(nextStep.expected_date)
    : null;

  return (
    <article className="bg-white p-4 sm:[&:last-child:nth-child(odd)]:col-span-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-[14px] font-semibold tracking-tight text-brand-navy">
            {filingDisplayName(filing)}
          </h3>
          {filing.display_name && JURISDICTION_LABEL[filing.jurisdiction] && (
            <div className="mt-0.5 text-[10px] font-medium uppercase tracking-label text-gray-500">
              {JURISDICTION_LABEL[filing.jurisdiction]}
            </div>
          )}
        </div>
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-label ${
            OUTCOME_BADGE[filing.outcome]
          }`}
        >
          {OUTCOME_LABEL[filing.outcome]}
        </span>
      </div>

      {/* Progress dots */}
      {steps.length > 0 && (
        <div className="mt-3 flex items-center gap-[3px]">
          {steps.map((s, i) => (
            <span
              key={i}
              className={`h-[6px] flex-1 rounded-full ${
                s.status === "done"
                  ? "bg-brand-navy"
                  : s.status === "overdue"
                    ? "bg-red-400"
                    : s.status === "next"
                      ? "bg-brand-gold"
                      : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      )}
      <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
        <span>
          {doneCount} of {steps.length} complete
        </span>
        {nextStep && (
          <span
            className={
              nextStep.status === "overdue"
                ? "font-medium text-red-700"
                : "text-brand-gold-ink"
            }
          >
            Next: {nextStep.label}
            {days != null &&
              (days < 0
                ? ` · ${-days}d overdue`
                : days === 0
                  ? " · today"
                  : ` · ${days}d`)}
          </span>
        )}
      </div>

      {/* Step detail list */}
      {steps.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {steps.map((s, i) => (
            <StepRow key={i} step={s} />
          ))}
        </ul>
      )}

      {filing.outcome_summary && (
        <p className="mt-3 border-t border-gray-100 pt-3 text-[12px] leading-[1.55] text-gray-600">
          {filing.outcome_summary}
        </p>
      )}

      {filing.case_url && (
        <a
          href={filing.case_url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-brand-navy underline decoration-brand-gold underline-offset-2 hover:decoration-2"
        >
          View case page ↗
        </a>
      )}
    </article>
  );
}

function StepRow({
  step,
}: {
  step: FilingStep & { status: StepStatus };
}) {
  const indicator =
    step.status === "done" ? (
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-brand-navy text-[8px] text-white">
        ✓
      </span>
    ) : step.status === "overdue" ? (
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-red-400 text-[9px] text-red-600">
        !
      </span>
    ) : step.status === "next" ? (
      <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-brand-gold" />
    ) : (
      <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-gray-300" />
    );

  const dateBit = step.actual_date ? (
    <span className="tabular-nums text-gray-700">
      {formatDate(step.actual_date)}
    </span>
  ) : step.expected_date ? (
    <span className="tabular-nums text-gray-500">
      exp. {formatDate(step.expected_date)}
    </span>
  ) : (
    <span className="text-gray-400">—</span>
  );

  return (
    <li className="flex items-start gap-2 text-[12px] leading-[1.55]">
      <span className="mt-[2px]">{indicator}</span>
      <span
        className={
          step.status === "done"
            ? "flex-1 text-gray-700"
            : step.status === "overdue"
              ? "flex-1 font-medium text-red-700"
              : step.status === "next"
                ? "flex-1 font-medium text-brand-navy"
                : "flex-1 text-gray-500"
        }
      >
        {step.label}
        {step.note && (
          <span className="ml-1 text-[11px] font-normal text-gray-500">
            — {step.note}
          </span>
        )}
      </span>
      {dateBit}
    </li>
  );
}

// ── Merged chronological view ──────────────────────────────────────────────

interface FlatStep {
  filing: Filing;
  step: FilingStep;
  date: string;
  isActual: boolean;
}

function MergedTimeline({ filings }: { filings: Filing[] }) {
  const flat = useMemo<FlatStep[]>(() => {
    const all: FlatStep[] = [];
    for (const f of filings) {
      for (const s of f.steps ?? []) {
        const d = effectiveDate(s);
        if (d) {
          all.push({
            filing: f,
            step: s,
            date: d,
            isActual: !!s.actual_date,
          });
        }
      }
    }
    all.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    return all;
  }, [filings]);

  if (!flat.length) {
    return (
      <div className="px-5 py-6 text-center text-sm text-gray-500">
        No dated events yet.
      </div>
    );
  }

  return (
    <ol className="divide-y divide-gray-100">
      {flat.map((e, i) => {
        const past = e.isActual;
        return (
          <li
            key={i}
            className="flex items-center gap-3 px-5 py-2.5 text-[13px]"
          >
            <span className="w-24 shrink-0 tabular-nums text-[12px] text-gray-600">
              {formatDate(e.date)}
            </span>
            <span
              className={`inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-label ${
                past
                  ? "border-brand-navy/20 bg-brand-navy/5 text-brand-navy"
                  : "border-brand-gold/40 bg-brand-gold-light text-brand-gold-ink"
              }`}
            >
              {filingShortName(e.filing)}
            </span>
            <span
              className={
                past
                  ? "flex-1 text-gray-700"
                  : "flex-1 font-medium text-brand-navy"
              }
            >
              {e.step.label}
              {!past && (
                <span className="ml-1 text-[11px] text-gray-500">
                  (expected)
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function filingShortName(f: Filing): string {
  return REGULATOR_SHORT[f.jurisdiction] || f.jurisdiction;
}
