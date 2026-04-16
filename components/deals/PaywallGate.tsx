import Link from "next/link";
import { BuyReportButton } from "./BuyReportButton";

interface PaywallGateProps {
  isSignedIn?: boolean;
  // Single-purchase fields (from deal)
  allowSinglePurchase?: boolean;
  singlePurchasePrice?: number;
  slug?: string;
  // If user previously bought this deal but content was updated since
  purchaseExpired?: boolean;
}

export function PaywallGate({
  isSignedIn = false,
  allowSinglePurchase = false,
  singlePurchasePrice = 89,
  slug,
  purchaseExpired = false,
}: PaywallGateProps) {
  // Variant 3: user bought this deal but content was materially updated
  if (purchaseExpired && slug) {
    return (
      <section className="rounded-lg border border-brand-gold/40 bg-brand-gold-light/30 px-7 py-8 text-center">
        <div className="mb-2 text-[10px] font-medium uppercase tracking-label text-brand-gold-ink">
          Updated content
        </div>
        <h3 className="font-serif text-[20px] font-normal text-brand-navy">
          This situation has been updated
        </h3>
        <p className="mx-auto mt-2 max-w-[420px] text-[13px] leading-[1.6] text-gray-600">
          Your single-report access covers the content at the time of
          purchase. The editorial team has published a material update
          since then.
        </p>

        <div className="mx-auto mt-6 grid max-w-[420px] grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-[10px] font-medium uppercase tracking-label text-gray-500">
              Updated report
            </div>
            <div className="mt-1 text-[22px] font-semibold tabular-nums text-brand-navy">
              ${singlePurchasePrice}
            </div>
            <div className="text-[11px] text-gray-500">one-time</div>
            <div className="mt-3 w-full">
              {isSignedIn ? (
                <BuyReportButton slug={slug} price={singlePurchasePrice} />
              ) : (
                <Link
                  href="/sign-in"
                  className="block w-full rounded border border-brand-navy bg-white px-4 py-2 text-center text-[13px] font-medium text-brand-navy hover:bg-brand-navy hover:text-white"
                >
                  Sign in to buy
                </Link>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center rounded-lg border-[1.5px] border-brand-gold bg-white p-4">
            <div className="text-[10px] font-medium uppercase tracking-label text-brand-gold-ink">
              Full access
            </div>
            <div className="mt-1 text-[22px] font-semibold tabular-nums text-brand-navy">
              $499
            </div>
            <div className="text-[11px] text-gray-500">per month</div>
            <div className="mt-3 w-full">
              <Link
                href="/subscribe"
                className="block w-full rounded bg-brand-navy px-4 py-2 text-center text-[13px] font-medium text-white hover:bg-brand-navy-dark"
              >
                Subscribe
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variant 2: deal allows single purchase — show two options
  if (allowSinglePurchase && slug) {
    return (
      <section className="rounded-lg border border-gray-200 bg-white px-7 py-8 text-center">
        <div className="mb-2 text-[10px] font-medium uppercase tracking-label text-gray-500">
          Members only
        </div>
        <h3 className="font-serif text-[20px] font-normal text-brand-navy">
          Full intelligence on this situation
        </h3>

        <div className="mx-auto mt-6 grid max-w-[480px] grid-cols-1 gap-4 text-left sm:grid-cols-2">
          {/* Single report card */}
          <div className="flex flex-col rounded-lg border border-gray-200 p-5">
            <div className="text-[10px] font-medium uppercase tracking-label text-gray-500">
              This report
            </div>
            <div className="mt-2 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-[26px] font-semibold text-brand-navy">
                ${singlePurchasePrice}
              </span>
              <span className="text-[12px] text-gray-500">one-time</span>
            </div>
            <ul className="mt-4 flex-1 space-y-1.5">
              {[
                "Full analysis for this deal",
                "Regulatory filings + activism",
                "Documents + key facts",
                "Point-in-time snapshot access",
              ].map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-1.5 text-[12px] leading-[1.5] text-gray-600"
                >
                  <span className="mt-[5px] block h-1 w-1 shrink-0 rounded-full bg-brand-gold" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-5">
              {isSignedIn ? (
                <BuyReportButton slug={slug} price={singlePurchasePrice} />
              ) : (
                <Link
                  href="/sign-up"
                  className="block w-full rounded border border-brand-navy bg-white px-4 py-2.5 text-center text-[13px] font-medium text-brand-navy hover:bg-brand-navy hover:text-white"
                >
                  Sign up to buy
                </Link>
              )}
            </div>
          </div>

          {/* Subscription card */}
          <div className="flex flex-col rounded-lg border-[1.5px] border-brand-gold bg-white p-5">
            <div className="text-[10px] font-medium uppercase tracking-label text-brand-gold-ink">
              Full access
            </div>
            <div className="mt-2 flex items-baseline gap-1.5 tabular-nums">
              <span className="text-[26px] font-semibold text-brand-navy">
                $499
              </span>
              <span className="text-[12px] text-gray-500">per month</span>
            </div>
            <ul className="mt-4 flex-1 space-y-1.5">
              {[
                "Every active situation",
                "Ongoing updates as deals evolve",
                "Watchlist + email alerts",
                "Cancel anytime",
              ].map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-1.5 text-[12px] leading-[1.5] text-gray-600"
                >
                  <span className="mt-[5px] block h-1 w-1 shrink-0 rounded-full bg-brand-gold" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <Link
                href="/subscribe"
                className="block w-full rounded bg-brand-navy px-4 py-2.5 text-center text-[13px] font-medium text-white hover:bg-brand-navy-dark"
              >
                Subscribe — $499/mo
              </Link>
            </div>
          </div>
        </div>

        {!isSignedIn && (
          <p className="mt-4 text-[12px] text-gray-500">
            Already a member?{" "}
            <Link
              href="/sign-in"
              className="text-brand-navy underline decoration-brand-gold underline-offset-2"
            >
              Sign in
            </Link>
          </p>
        )}
      </section>
    );
  }

  // Variant 1: subscription only (default)
  return (
    <section className="rounded-lg border border-gray-200 bg-white px-7 py-8 text-center">
      <div className="mb-2 text-[10px] font-medium uppercase tracking-label text-gray-500">
        Members only
      </div>
      <h3 className="font-serif text-[20px] font-normal text-brand-navy">
        Full intelligence on this situation
      </h3>
      <p className="mx-auto mt-2 max-w-[420px] text-[13px] leading-[1.6] text-gray-600">
        Subscribe to unlock CTFN analysis, regulatory lifecycle tracking,
        deal documents, shareholder activism, and proprietary closing
        estimates.
      </p>
      <ul className="mx-auto mt-5 max-w-xs space-y-2 text-left">
        {[
          "Full CTFN editorial analysis + risk factors",
          "Per-regulator filing lifecycle with step tracking",
          "Shareholder activism + voting agreements",
          "Deal documents, advisors, key facts",
          "Watchlist alerts when situations move",
        ].map((f) => (
          <li
            key={f}
            className="flex items-start gap-2 text-[13px] leading-[1.5] text-gray-700"
          >
            <span className="mt-[5px] block h-1 w-1 shrink-0 rounded-full bg-brand-gold" />
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-col items-center gap-2">
        <Link
          href="/subscribe"
          className="rounded bg-brand-navy px-8 py-2.5 text-[13px] font-medium text-white hover:bg-brand-navy-dark"
        >
          Subscribe — $499/mo
        </Link>
        {!isSignedIn && (
          <Link
            href="/sign-in"
            className="text-[12px] text-gray-500 hover:text-brand-navy"
          >
            Already a member? Sign in
          </Link>
        )}
      </div>
    </section>
  );
}
