import {
  formatPrice,
  formatPercent,
  formatUSDM,
  formatDate,
  STAGE_BUCKET,
  BUCKET_ORDER,
  type StageBucket,
} from "@/lib/format";
import type { PublicDeal } from "@/lib/sanity/types";

const BUCKET_LABEL: Record<StageBucket, string> = {
  announced: "Announced",
  regulatory: "Regulatory",
  vote: "Shareholder vote",
  closing: "Closing",
};

export function SnapshotCard({
  deal,
  isPaid,
}: {
  deal: PublicDeal;
  isPaid: boolean;
}) {
  const activeBucket = STAGE_BUCKET[deal.status];
  const activeIdx = BUCKET_ORDER.indexOf(activeBucket);

  const metrics: {
    label: string;
    value: string;
    sub?: string;
  }[] = [
    {
      label: "Implied equity value",
      value: formatUSDM(deal.equity_value),
      sub: deal.shares_outstanding
        ? `${deal.shares_outstanding.toLocaleString()}M shares out`
        : undefined,
    },
    {
      label: "Offer price",
      value:
        deal.offer_terms ||
        (deal.offer_price != null ? formatPrice(deal.offer_price) : "—"),
      sub: deal.offer_terms ? undefined : deal.offer_price ? "per share" : undefined,
    },
    {
      label: "Premium to unaffected",
      value: formatPercent(deal.premium),
      sub: deal.premium_reference,
    },
    {
      label: "Termination fee",
      value: formatTermFees(deal),
      sub: deal.reverse_termination_fee
        ? "Target / acquirer RTF"
        : deal.termination_fee_pct
          ? `${deal.termination_fee_pct}% of equity`
          : undefined,
    },
  ];

  return (
    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between bg-brand-navy px-4 py-2.5">
        <span className="text-[10px] uppercase tracking-label text-white/55">
          {isPaid ? "Deal snapshot" : "Deal snapshot — free preview"}
        </span>
        {deal.ctfn_estimated_close && (
          <span className="text-[11px] font-medium text-brand-gold">
            CTFN closing estimate: {formatDate(deal.ctfn_estimated_close)}
          </span>
        )}
      </div>

      <dl className="grid grid-cols-2 border-b border-gray-200 sm:grid-cols-4">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className={`p-4 ${i < metrics.length - 1 ? "sm:border-r" : ""} ${
              i < 2 ? "border-b sm:border-b-0" : ""
            } border-gray-200`}
          >
            <dt className="text-[10px] font-medium uppercase tracking-label text-gray-500">
              {m.label}
            </dt>
            <dd className="mt-1 text-[16px] font-semibold tabular-nums text-brand-navy">
              {m.value}
            </dd>
            {m.sub && (
              <div className="mt-1 text-[11px] text-gray-500">{m.sub}</div>
            )}
          </div>
        ))}
      </dl>

      {/* Stage progress bar */}
      <div className="px-4 py-3">
        <div className="flex">
          {BUCKET_ORDER.map((bucket, i) => {
            const done = i < activeIdx;
            const active = i === activeIdx;
            return (
              <div
                key={bucket}
                className="relative flex-1 pt-2.5 text-center"
              >
                {/* left track */}
                {i > 0 && (
                  <span
                    className={`absolute left-0 top-[3px] h-[1.5px] w-1/2 ${
                      i <= activeIdx ? "bg-brand-navy" : "bg-gray-200"
                    }`}
                  />
                )}
                {/* right track */}
                {i < BUCKET_ORDER.length - 1 && (
                  <span
                    className={`absolute left-1/2 top-[3px] h-[1.5px] w-1/2 ${
                      done
                        ? "bg-brand-navy"
                        : active
                          ? "bg-brand-gold"
                          : "bg-gray-200"
                    }`}
                  />
                )}
                <span
                  className={`relative z-10 mx-auto mb-1.5 block h-2 w-2 rounded-full ${
                    done
                      ? "bg-brand-navy"
                      : active
                        ? "bg-brand-gold"
                        : "bg-gray-300"
                  }`}
                />
                <span
                  className={`text-[10px] font-medium uppercase tracking-label ${
                    done
                      ? "text-brand-navy"
                      : active
                        ? "text-brand-gold"
                        : "text-gray-500"
                  }`}
                >
                  {BUCKET_LABEL[bucket]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {deal.termination_fee_notes && (
        <p className="border-t border-gray-100 px-4 py-2 text-[11px] text-gray-500">
          {deal.termination_fee_notes}
        </p>
      )}
    </section>
  );
}

function formatTermFees(deal: PublicDeal): string {
  const withPct = (amount?: number, pct?: number) => {
    if (amount == null) return null;
    const base =
      amount >= 1000 ? `$${(amount / 1000).toFixed(1)}bn` : `$${amount}mn`;
    return pct != null ? `${base} (${pct}%)` : base;
  };
  const t = withPct(deal.termination_fee, deal.termination_fee_pct);
  const r = withPct(
    deal.reverse_termination_fee,
    deal.reverse_termination_fee_pct,
  );
  if (t && r) return `${t} / ${r}`;
  return t || "—";
}
