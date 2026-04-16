import { notFound } from "next/navigation";
import { sanityClient, sanityServerClient } from "@/lib/sanity/client";
import {
  PUBLIC_DEAL_QUERY,
  PAID_DEAL_QUERY,
} from "@/lib/sanity/queries";
import type { PaidDeal, PublicDeal } from "@/lib/sanity/types";
import { clerkClient } from "@clerk/nextjs/server";
import {
  getCurrentUserContext,
  getUserWatchlist,
  getUserPurchases,
  isPaidStatus,
  hasDealAccess,
} from "@/lib/clerk/helpers";
import type { UserMetadata } from "@/lib/clerk/helpers";
import { DealHeader } from "@/components/deals/DealHeader";
import { SnapshotCard } from "@/components/deals/SnapshotCard";
import { KeyRiskPull } from "@/components/deals/KeyRiskPull";
import { KeyFactsTable } from "@/components/deals/KeyFactsTable";
import { PaywallGate } from "@/components/deals/PaywallGate";
import { RegulatoryFilings } from "@/components/deals/RegulatoryFilings";
import { ShareholderVote } from "@/components/deals/ShareholderVote";
import { CtfnAnalysis } from "@/components/deals/CtfnAnalysis";
import { ShareholderActivism } from "@/components/deals/ShareholderActivism";
import { CollapsibleProse } from "@/components/deals/CollapsibleProse";
import { DocumentLibrary } from "@/components/deals/DocumentLibrary";
import { CheckoutSuccess } from "@/components/deals/CheckoutSuccess";
import { FollowButton } from "@/components/ui/FollowButton";

export const revalidate = 60;

export default async function DealPage({
  params,
}: {
  params: { slug: string };
}) {
  const ctx = await getCurrentUserContext();

  // Read fresh metadata so content unlocks immediately after payment.
  let isSubscriber = ctx.isPaid;
  let freshMeta: UserMetadata | undefined;
  if (ctx.userId && !isSubscriber) {
    const freshUser = await clerkClient.users.getUser(ctx.userId);
    freshMeta = (freshUser.publicMetadata ?? {}) as UserMetadata;
    isSubscriber = isPaidStatus(freshMeta);
  }

  // Check if user bought this specific deal (single-report purchase)
  const purchases = ctx.userId
    ? freshMeta?.purchased_deals ??
      (await getUserPurchases(ctx.userId))
    : [];

  // Fetch with server client (no CDN cache) so last_material_update
  // reflects the latest Studio publish immediately.
  const publicDeal = await sanityServerClient.fetch<PublicDeal>(PUBLIC_DEAL_QUERY, {
    slug: params.slug,
  });
  if (!publicDeal) notFound();

  const ownsDeal = hasDealAccess(
    purchases,
    params.slug,
    publicDeal.last_material_update,
  );
  const purchaseExpired =
    purchases.some((p) => p.slug === params.slug) && !ownsDeal;
  const canView = isSubscriber || ownsDeal;

  // Layer-3 gating: only fetch paid fields if user has access
  const deal = canView
    ? await sanityServerClient.fetch<PaidDeal>(PAID_DEAL_QUERY, {
        slug: params.slug,
      })
    : publicDeal;

  const watchlist =
    ctx.userId && isSubscriber ? await getUserWatchlist(ctx.userId) : [];
  const isFollowing = watchlist.includes(params.slug);
  const followControl =
    isSubscriber && ctx.userId ? (
      <FollowButton slug={params.slug} initialFollowing={isFollowing} />
    ) : null;

  return (
    <main className="mx-auto max-w-[720px] px-6 pt-10">
      <CheckoutSuccess />
      <DealHeader deal={deal} followControl={followControl} />

      <div className="mt-7 space-y-6">
        <SnapshotCard deal={deal} isPaid={canView} />

        {deal.key_risk_summary && <KeyRiskPull text={deal.key_risk_summary} />}

        {canView ? (
          <>
            <KeyFactsTable deal={deal as PaidDeal} />

            <RegulatoryFilings filings={(deal as PaidDeal).filings} />

            <ShareholderVote vote={(deal as PaidDeal).shareholder_vote} />

            <CtfnAnalysis
              analysis={(deal as PaidDeal).ctfn_analysis}
              risks={(deal as PaidDeal).risk_factors}
            />

            <ShareholderActivism
              entries={(deal as PaidDeal).shareholder_activism}
            />

            {(deal as PaidDeal).background?.length ? (
              <section className="rounded-lg border border-gray-200 bg-white px-5 py-4">
                <h2 className="mb-3 text-[11px] font-medium uppercase tracking-label text-gray-500">
                  Background
                </h2>
                <CollapsibleProse
                  value={(deal as PaidDeal).background}
                  maxLines={12}
                />
              </section>
            ) : null}

            <DocumentLibrary docs={(deal as PaidDeal).documents} />
          </>
        ) : (
          <PaywallGate
            isSignedIn={!!ctx.userId}
            allowSinglePurchase={publicDeal.allow_single_purchase}
            singlePurchasePrice={publicDeal.single_purchase_price}
            slug={params.slug}
            purchaseExpired={purchaseExpired}
          />
        )}
      </div>

      <div className="py-12" />
    </main>
  );
}
