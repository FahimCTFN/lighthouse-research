import Link from "next/link";
import { formatDate } from "@/lib/format";

export function UpdateBanner({ purchaseDate }: { purchaseDate: string }) {
  return (
    <div className="rounded-lg border border-brand-gold/40 bg-brand-gold-light/50 px-5 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[12px] font-medium text-brand-gold-ink">
            You have access to this situation
          </div>
          <div className="mt-0.5 text-[11px] text-brand-gold-ink/75">
            Purchased {formatDate(purchaseDate)}. Includes all updates
            until this deal closes or terminates. Subscribe for access to
            all active situations and watchlist alerts.
          </div>
        </div>
        <Link
          href="/subscribe"
          className="shrink-0 rounded bg-brand-navy px-4 py-1.5 text-[11px] font-medium text-white hover:bg-brand-navy-dark"
        >
          Subscribe — $499/mo
        </Link>
      </div>
    </div>
  );
}
