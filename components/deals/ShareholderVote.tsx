import { annotateSteps } from "@/lib/filings";
import { formatDate, daysUntil } from "@/lib/format";
import type { FilingStep, ShareholderVote as ShareholderVoteData, ShareholderVoteOutcome } from "@/lib/sanity/types";

const OUTCOME_LABEL: Record<ShareholderVoteOutcome, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  postponed: "Postponed",
  not_required: "Not required",
};

const OUTCOME_BADGE: Record<ShareholderVoteOutcome, string> = {
  pending: "bg-gray-100 text-gray-700 border border-gray-300",
  approved: "bg-green-50 text-green-800 border border-green-200",
  rejected: "bg-red-50 text-red-800 border border-red-200",
  postponed: "bg-brand-gold-light text-brand-gold-ink border border-brand-gold/40",
  not_required: "bg-gray-50 text-gray-500 border border-gray-200",
};

export function ShareholderVote({ vote }: { vote?: ShareholderVoteData }) {
  if (!vote || (!vote.steps?.length && !vote.outcome_summary && !vote.label)) {
    return null;
  }
  const outcome = vote.outcome ?? "pending";
  const steps = annotateSteps(vote.steps);
  const doneCount = steps.filter((s) => s.status === "done").length;
  const nextStep = steps.find(
    (s) => s.status === "next" || s.status === "overdue",
  );
  const days = nextStep?.expected_date ? daysUntil(nextStep.expected_date) : null;

  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <header className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
        <div>
          <h2 className="text-[11px] font-medium uppercase tracking-label text-gray-500">
            Shareholder Vote
          </h2>
          {vote.label && (
            <p className="mt-0.5 text-[13px] text-gray-600">{vote.label}</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-label ${OUTCOME_BADGE[outcome]}`}
        >
          {OUTCOME_LABEL[outcome]}
        </span>
      </header>

      <div className="px-5 py-4">
        {vote.committed_pct != null && vote.committed_pct > 0 && (
          <CommittedMeter
            pct={vote.committed_pct}
            notes={vote.committed_notes}
          />
        )}

        {steps.length > 0 && (
          <>
            <div className="flex items-center gap-[3px]">
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

            <ul className="mt-4 space-y-1.5">
              {steps.map((s, i) => (
                <StepRow key={i} step={s} />
              ))}
            </ul>
          </>
        )}

        {vote.outcome_summary && (
          <p className="mt-4 border-t border-gray-100 pt-3 text-[12px] leading-[1.55] text-gray-600">
            {vote.outcome_summary}
          </p>
        )}
      </div>
    </section>
  );
}

function CommittedMeter({
  pct,
  notes,
}: {
  pct: number;
  notes?: string;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="mb-5 rounded-md border border-brand-gold/30 bg-brand-gold-light/60 px-4 py-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-medium uppercase tracking-label text-brand-gold-ink">
          Voting agreements
        </span>
        <span className="text-[18px] font-semibold tabular-nums text-brand-gold-ink">
          {clamped.toFixed(clamped % 1 === 0 ? 0 : 1)}%
          <span className="ml-1 text-[11px] font-normal text-brand-gold-ink/80">
            committed
          </span>
        </span>
      </div>
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/70"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-brand-gold"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="mt-2 text-[11px] leading-[1.5] text-brand-gold-ink/85">
        {notes
          ? `${notes} — bound to vote FOR.`
          : "Shares bound to vote FOR via signed voting agreements."}
      </p>
    </div>
  );
}

function StepRow({
  step,
}: {
  step: FilingStep & {
    status: "done" | "next" | "overdue" | "upcoming" | "planned";
  };
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
    <li className="flex items-start gap-2 text-[13px] leading-[1.55]">
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
