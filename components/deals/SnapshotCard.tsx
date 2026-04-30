import { formatDate, daysUntil, STAGE_LABEL } from "@/lib/format";
import { deriveNextKeyEvent } from "@/lib/nextEvent";
import type { PublicDeal, PaidDeal } from "@/lib/sanity/types";

export function SnapshotCard({
  deal,
  isPaid,
}: {
  deal: PublicDeal | PaidDeal;
  isPaid: boolean;
}) {
  const nextEvent = deriveNextKeyEvent(deal as PaidDeal);
  const days = nextEvent ? daysUntil(nextEvent.date) : null;

  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between bg-brand-navy px-4 py-2.5">
        <span className="text-[10px] uppercase tracking-label text-white/55">
          {isPaid ? "Deal snapshot" : "Deal snapshot — free preview"}
        </span>
        <span className="rounded border border-white/20 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-label text-white/85">
          {STAGE_LABEL[deal.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        {/* Next event */}
        <div className="p-4">
          <div className="text-[10px] font-medium uppercase tracking-label text-gray-500">
            Next event
          </div>
          {nextEvent ? (
            <>
              <div className="mt-1 text-[15px] font-semibold leading-tight text-brand-navy">
                {nextEvent.label}
              </div>
              <div className="mt-1 flex items-baseline gap-2 text-[12px] tabular-nums text-gray-600">
                <span>{formatDate(nextEvent.date)}</span>
                {days != null && days >= 0 && (
                  <span className="text-brand-gold-ink">· in {days}d</span>
                )}
              </div>
            </>
          ) : (
            <div className="mt-1 text-[15px] font-semibold text-gray-400">—</div>
          )}
        </div>

        {/* CTFN estimated close */}
        <div className="p-4">
          <div className="text-[10px] font-medium uppercase tracking-label text-gray-500">
            CTFN estimated close
          </div>
          {deal.ctfn_estimated_close ? (
            <div className="mt-1 text-[15px] font-semibold tabular-nums text-brand-navy">
              {formatDate(deal.ctfn_estimated_close)}
            </div>
          ) : (
            <div className="mt-1 text-[15px] font-semibold text-gray-400">—</div>
          )}
        </div>
      </div>

      {/* Key risks — full-width second row */}
      <div className="border-t border-gray-200 px-4 py-3">
        <div className="text-[10px] font-medium uppercase tracking-label text-gray-500">
          Key risks
        </div>
        {deal.key_risk_summary ? (
          <p className="mt-1 text-[13px] leading-[1.55] text-ink">
            {deal.key_risk_summary}
          </p>
        ) : (
          <div className="mt-1 text-[13px] text-gray-400">—</div>
        )}
      </div>
    </section>
  );
}
