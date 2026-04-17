import Link from "next/link";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { sanityClient } from "@/lib/sanity/client";
import { groq } from "next-sanity";
import {
  getCurrentUserContext,
  getUserWatchlist,
} from "@/lib/clerk/helpers";
import type { UserMetadata, DealPurchase } from "@/lib/clerk/helpers";
import { StageBadge, SectorTag } from "@/components/ui/Badge";
import { formatDate, formatTickers } from "@/lib/format";
import { ManageBillingButton } from "./ManageBillingButton";
import type { DealListItem } from "@/lib/sanity/types";

const WATCHLIST_DEALS_QUERY = groq`
  *[_type == "deal" && slug.current in $slugs] {
    _id, _updatedAt, acquirer, target, status, sector,
    acquirer_ticker, target_ticker,
    "slug": slug.current,
    next_key_event_date, next_key_event_label
  }
`;

const PURCHASED_DEALS_QUERY = groq`
  *[_type == "deal" && slug.current in $slugs] {
    _id, acquirer, target, status, sector,
    acquirer_ticker, target_ticker,
    "slug": slug.current,
    last_material_update
  }
`;

const STATUS_LABEL: Record<string, string> = {
  active: "Pro",
  past_due: "Pro (past due)",
  cancelled: "Cancelled",
  none: "Free",
};

const STATUS_BADGE: Record<string, string> = {
  active:
    "bg-brand-gold-light text-brand-gold-ink border border-brand-gold/40",
  past_due: "bg-amber-50 text-amber-800 border border-amber-200",
  cancelled: "bg-gray-100 text-gray-600 border border-gray-300",
  none: "bg-gray-50 text-gray-500 border border-gray-200",
};

export default async function AccountPage() {
  const { userId } = auth();
  const ctx = await getCurrentUserContext();
  if (!userId) return null;

  const user = await currentUser();

  // Fresh metadata for purchased_deals
  const freshUser = await clerkClient.users.getUser(userId);
  const freshMeta = (freshUser.publicMetadata ?? {}) as UserMetadata;
  const purchases: DealPurchase[] = freshMeta.purchased_deals ?? [];
  const purchaseSlugs = purchases.map((p) => p.slug);

  // Fetch watchlist deals
  const watchlistSlugs = await getUserWatchlist(userId);
  const watched = watchlistSlugs.length
    ? await sanityClient.fetch<DealListItem[]>(WATCHLIST_DEALS_QUERY, {
        slugs: watchlistSlugs,
      })
    : [];

  // Fetch purchased deals from Sanity to check material update status
  const purchasedDeals = purchaseSlugs.length
    ? await sanityClient.fetch<
        {
          _id: string;
          acquirer: string;
          target: string;
          status: string;
          sector: string;
          acquirer_ticker?: string;
          target_ticker?: string;
          slug: string;
          last_material_update?: string;
        }[]
      >(PURCHASED_DEALS_QUERY, { slugs: purchaseSlugs })
    : [];

  const status = freshMeta.stripeSubscriptionStatus ?? "none";
  const isPaid =
    status === "active" || status === "past_due" || !!freshMeta.manualAccessGrant;
  const joined = user?.createdAt ? new Date(user.createdAt) : null;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="border-b border-gray-200 pb-6">
        <div className="text-[11px] font-medium uppercase tracking-label text-gray-500">
          Account
        </div>
        <h1 className="mt-1 font-serif text-[28px] leading-[1.25] tracking-tight text-brand-navy">
          {user?.firstName || user?.primaryEmailAddress?.emailAddress}
        </h1>
      </header>

      {/* Subscription summary */}
      <section className="mt-8 rounded-lg border border-gray-200 bg-white">
        <header className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-[11px] font-medium uppercase tracking-label text-gray-500">
            Subscription
          </h2>
        </header>
        <dl className="grid grid-cols-2 gap-px bg-gray-100 sm:grid-cols-4">
          <Cell label="Email" value={user?.primaryEmailAddress?.emailAddress} />
          <Cell
            label="Status"
            valueNode={
              <span
                className={`inline-flex rounded px-2 py-[2px] text-[11px] font-medium uppercase tracking-label ${STATUS_BADGE[status] ?? STATUS_BADGE.none}`}
              >
                {STATUS_LABEL[status] ?? status}
              </span>
            }
          />
          <Cell
            label="Member since"
            value={joined ? joined.toLocaleDateString() : undefined}
          />
          <Cell
            label="Reports purchased"
            value={purchases.length > 0 ? String(purchases.length) : "0"}
          />
          {ctx.metadata.manualAccessGrant && (
            <Cell
              label="Comp access"
              value={
                ctx.metadata.manualAccessExpiry
                  ? `Until ${new Date(ctx.metadata.manualAccessExpiry).toLocaleDateString()}`
                  : "No expiry"
              }
            />
          )}
        </dl>
        <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 px-5 py-4">
          {freshMeta.stripeCustomerId ? (
            <ManageBillingButton />
          ) : (
            <Link
              href="/subscribe"
              className="rounded bg-brand-navy px-4 py-2 text-[13px] font-medium text-white hover:bg-brand-navy-dark"
            >
              Subscribe — $499/mo
            </Link>
          )}
          <span className="text-[12px] text-gray-500">
            {freshMeta.stripeCustomerId
              ? "Manage billing, update card, or cancel via Stripe Customer Portal."
              : "Subscribe to unlock all deals, watchlist alerts, and ongoing updates."}
          </span>
        </div>
      </section>

      {/* Purchased reports */}
      {purchases.length > 0 && (
        <section className="mt-6 rounded-lg border border-gray-200 bg-white">
          <header className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
            <h2 className="text-[11px] font-medium uppercase tracking-label text-gray-500">
              Purchased reports
            </h2>
            <span className="text-[11px] tabular-nums text-gray-500">
              {purchases.length} {purchases.length === 1 ? "report" : "reports"}
            </span>
          </header>
          <ul className="divide-y divide-gray-100">
            {purchases.map((p) => {
              const deal = purchasedDeals.find((d) => d.slug === p.slug);
              const tickers = deal
                ? formatTickers(deal.target_ticker, deal.acquirer_ticker)
                : undefined;

              return (
                <li
                  key={p.slug}
                  className="flex items-center justify-between gap-4 px-5 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {deal && <StageBadge status={deal.status as DealListItem["status"]} />}
                      {tickers && (
                        <span className="font-mono text-[11px] tracking-wide text-gray-600">
                          {tickers}
                        </span>
                      )}
                      <span className="inline-flex rounded border border-green-200 bg-green-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-label text-green-800">
                        Purchased
                      </span>
                    </div>
                    <Link
                      href={`/deals/${p.slug}`}
                      className="mt-1 block text-[14px] font-medium text-brand-navy hover:underline"
                    >
                      {deal
                        ? `${deal.target} / ${deal.acquirer}`
                        : p.slug.replace(/-/g, " ")}
                    </Link>
                    <div className="mt-0.5 text-[11px] text-gray-500">
                      Purchased {formatDate(p.purchased_at)}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Link
                      href={`/deals/${p.slug}`}
                      className="rounded border border-gray-300 px-3 py-1.5 text-[11px] font-medium text-brand-navy hover:border-brand-navy"
                    >
                      View report
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Watchlist */}
      <section className="mt-6 rounded-lg border border-gray-200 bg-white">
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h2 className="text-[11px] font-medium uppercase tracking-label text-gray-500">
            Watchlist
          </h2>
          <span className="text-[11px] tabular-nums text-gray-500">
            {watched.length} {watched.length === 1 ? "deal" : "deals"}
          </span>
        </header>

        {!isPaid ? (
          <div className="px-5 py-6 text-[13px] text-gray-600">
            Watchlist alerts are available with a Pro subscription.{" "}
            <Link
              href="/subscribe"
              className="text-brand-navy underline decoration-brand-gold underline-offset-2"
            >
              Subscribe to enable.
            </Link>
          </div>
        ) : watched.length === 0 ? (
          <div className="px-5 py-8 text-center text-[13px] text-gray-500">
            No deals in your watchlist yet. Follow any situation from its page
            to start receiving alerts.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {watched.map((d) => {
              const tickers = formatTickers(
                d.target_ticker,
                d.acquirer_ticker,
              );
              return (
                <li
                  key={d._id}
                  className="flex items-center justify-between gap-4 px-5 py-3"
                >
                  <Link
                    href={`/deals/${d.slug}`}
                    className="group min-w-0 flex-1"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <StageBadge status={d.status} />
                      <SectorTag sector={d.sector} />
                      {tickers && (
                        <span className="font-mono text-[11px] tracking-wide text-gray-600">
                          {tickers}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-[14px] font-medium text-brand-navy group-hover:underline">
                      {d.target} <span className="text-gray-400">/</span>{" "}
                      {d.acquirer}
                    </div>
                  </Link>
                  <div className="shrink-0 text-right">
                    {d.next_key_event_date && (
                      <>
                        <div className="text-[10px] font-medium uppercase tracking-label text-gray-500">
                          {d.next_key_event_label || "Next event"}
                        </div>
                        <div className="text-[12px] tabular-nums text-gray-700">
                          {formatDate(d.next_key_event_date)}
                        </div>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

function Cell({
  label,
  value,
  valueNode,
}: {
  label: string;
  value?: string;
  valueNode?: React.ReactNode;
}) {
  return (
    <div className="bg-white p-4">
      <dt className="text-[10px] font-medium uppercase tracking-label text-gray-500">
        {label}
      </dt>
      <dd className="mt-1 text-[14px] font-medium text-brand-navy">
        {valueNode ?? value ?? "—"}
      </dd>
    </div>
  );
}
