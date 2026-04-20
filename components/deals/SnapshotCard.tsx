import { formatDate, daysUntil, STAGE_LABEL } from "@/lib/format";
import type { PublicDeal } from "@/lib/sanity/types";

export function SnapshotCard({
  deal,
  isPaid,
}: {
  deal: PublicDeal;
  isPaid: boolean;
}) {
  const prob = deal.ctfn_closing_probability;
  const days = daysUntil(deal.next_key_event_date);

  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between bg-brand-navy px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-label text-white/55">
            {isPaid ? "Deal snapshot" : "Deal snapshot — free preview"}
          </span>
          <span className="rounded border border-white/20 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-label text-white/85">
            {STAGE_LABEL[deal.status]}
          </span>
        </div>
        {deal.ctfn_estimated_close && (
          <span className="text-[11px] font-medium text-brand-gold">
            CTFN closing estimate: {formatDate(deal.ctfn_estimated_close)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {/* Next event */}
        <div className="p-4">
          <div className="text-[10px] font-medium uppercase tracking-label text-gray-500">
            Next event
          </div>
          {deal.next_key_event_date || deal.next_key_event_label ? (
            <>
              <div className="mt-1 text-[15px] font-semibold leading-tight text-brand-navy">
                {deal.next_key_event_label || "—"}
              </div>
              <div className="mt-1 flex items-baseline gap-2 text-[12px] tabular-nums text-gray-600">
                <span>{formatDate(deal.next_key_event_date)}</span>
                {days != null && days >= 0 && (
                  <span className="text-brand-gold-ink">· in {days}d</span>
                )}
              </div>
            </>
          ) : (
            <div className="mt-1 text-[15px] font-semibold text-gray-400">—</div>
          )}
        </div>

        {/* CTFN closing probability */}
        <div className="p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] font-medium uppercase tracking-label text-gray-500">
              CTFN closing prob.
            </span>
            {prob != null && (
              <span className="text-[18px] font-semibold tabular-nums text-brand-navy">
                {prob}%
              </span>
            )}
          </div>
          {prob != null ? (
            <div
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100"
              role="progressbar"
              aria-valuenow={prob}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${prob}%`,
                  backgroundColor: probColor(prob),
                }}
              />
            </div>
          ) : (
            <div className="mt-1 text-[15px] font-semibold text-gray-400">—</div>
          )}
        </div>

        {/* Key risks */}
        <div className="p-4">
          <div className="text-[10px] font-medium uppercase tracking-label text-gray-500">
            Key risks
          </div>
          {deal.key_risk_summary ? (
            <p className="mt-1 text-[13px] leading-[1.5] text-ink">
              {deal.key_risk_summary}
            </p>
          ) : (
            <div className="mt-1 text-[15px] font-semibold text-gray-400">—</div>
          )}
        </div>
      </div>
    </section>
  );
}

function probColor(p: number): string {
  if (p >= 75) return "#16a34a"; // green-600
  if (p >= 50) return "#d4860a"; // brand gold
  if (p >= 25) return "#ea580c"; // orange-600
  return "#dc2626"; // red-600
}
