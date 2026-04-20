import Link from "next/link";
import { StageBadge, SectorTag } from "@/components/ui/Badge";
import {
  formatPrice,
  formatPercent,
  formatDate,
  formatUSDM,
  formatTickers,
  daysUntil,
} from "@/lib/format";
import type { DealListItem } from "@/lib/sanity/types";

export function DealCard({
  deal,
  locked = false,
}: {
  deal: DealListItem;
  locked?: boolean;
}) {
  const days = daysUntil(deal.next_key_event_date);
  return (
    <Link
      href={`/deals/${deal.slug}`}
      className="group relative flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 transition hover:border-brand-navy hover:shadow-sm"
    >
      {locked && (
        <div className="absolute right-3 top-3 rounded bg-brand-navy/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-label text-brand-gold">
          🔒 Pro
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <StageBadge status={deal.status} />
        <SectorTag sector={deal.sector} />
      </div>

      <div>
        <h3 className="font-serif text-[18px] leading-[1.3] tracking-tight text-brand-navy">
          {deal.target} <span className="text-gray-400">/</span>{" "}
          {deal.acquirer}
        </h3>
        {(() => {
          const t = formatTickers(deal.target_ticker, deal.acquirer_ticker);
          return t ? (
            <p className="mt-1 font-mono text-[11px] tracking-wide text-gray-600">
              {t}
            </p>
          ) : null;
        })()}
        {deal.deck && (
          <p className="mt-2 line-clamp-2 text-[13px] leading-[1.55] text-gray-600">
            {deal.deck}
          </p>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-3 tabular-nums">
        <Stat label="Equity value" value={formatUSDM(deal.equity_value)} />
        <Stat label="Premium" value={formatPercent(deal.premium)} />
      </dl>

      <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] tabular-nums text-gray-500">
        <span>
          Est. close{" "}
          <span className="text-gray-700">
            {formatDate(deal.ctfn_estimated_close)}
          </span>
        </span>
        {days != null && days >= 0 ? (
          <span className="text-brand-gold-ink">
            Next event in{" "}
            <span className="font-medium">{days}d</span>
          </span>
        ) : (
          <span>{formatPrice(deal.offer_price)} / sh</span>
        )}
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-medium uppercase tracking-label text-gray-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-[15px] font-semibold tabular-nums text-brand-navy">
        {value}
      </dd>
    </div>
  );
}
