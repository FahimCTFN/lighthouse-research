import Link from "next/link";
import type { ReactNode } from "react";
import { ActiveSituationTag, SectorTag, StageBadge } from "@/components/ui/Badge";
import {
  formatDate,
  formatSector,
  formatTickers,
} from "@/lib/format";
import type { PublicDeal } from "@/lib/sanity/types";

export function DealHeader({
  deal,
  followControl,
}: {
  deal: PublicDeal;
  followControl?: ReactNode;
}) {
  return (
    <header className="border-b border-gray-200 pb-6">
      <Link
        href="/"
        className="mb-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-label text-gray-500 hover:text-brand-navy"
      >
        <span aria-hidden>←</span> All active situations
      </Link>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <ActiveSituationTag />
        <SectorTag sector={deal.sector} />
        <StageBadge status={deal.status} />
        {followControl && (
          <span className="ml-auto hidden sm:block">{followControl}</span>
        )}
        {deal._updatedAt && (
          <>
            <span className="text-gray-300">·</span>
            <span className="text-[11px] text-gray-500">
              Updated {formatDate(deal._updatedAt)}
            </span>
          </>
        )}
        {deal.published_date && (
          <>
            <span className="text-gray-300">·</span>
            <span className="text-[11px] text-gray-500">
              Published {formatDate(deal.published_date)}
            </span>
          </>
        )}
      </div>

      <h1 className="font-serif text-[22px] font-normal leading-[1.25] tracking-tight text-brand-navy sm:text-[28px]">
        {deal.target} / {deal.acquirer}
        {deal.equity_value ? (
          <span className="text-gray-500">
            {" "}
            — ${deal.equity_value >= 1000 ? `${(deal.equity_value / 1000).toFixed(0)}bn` : `${deal.equity_value}mn`}{" "}
            {formatSector(deal.sector).toLowerCase()} deal
          </span>
        ) : null}
      </h1>

      {(() => {
        const t = formatTickers(deal.target_ticker, deal.acquirer_ticker);
        return t ? (
          <div className="mt-1.5 font-mono text-[12px] tracking-wide text-gray-600">
            {t}
          </div>
        ) : null;
      })()}

      {deal.deck && (
        <p className="mt-3 border-l-[3px] border-brand-gold pl-4 font-serif text-[17px] leading-[1.55] text-gray-700">
          {deal.deck}
        </p>
      )}

      {followControl && (
        <div className="mt-4 sm:hidden">{followControl}</div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy text-[11px] font-medium text-brand-gold">
          CT
        </div>
        <div>
          <div className="text-[13px] font-medium text-brand-navy">
            CTFN Editorial
          </div>
          <div className="text-[11px] text-gray-500">
            Active Situations Desk · ctfn.news
          </div>
        </div>
      </div>
    </header>
  );
}
