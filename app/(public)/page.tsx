import { clerkClient } from "@clerk/nextjs/server";
import { sanityClient } from "@/lib/sanity/client";
import { ACTIVE_DEALS_QUERY } from "@/lib/sanity/queries";
import type { DealListItem } from "@/lib/sanity/types";
import { FilterBar } from "@/components/filters/FilterBar";
import { DealGrid } from "@/components/deals/DealGrid";
import { SubscriptionBanner } from "@/components/layout/SubscriptionBanner";
import { getCurrentUserContext, isPaidStatus } from "@/lib/clerk/helpers";
import type { UserMetadata, DealPurchase } from "@/lib/clerk/helpers";

export const revalidate = 60;

export default async function IndexPage() {
  const [ctx, deals] = await Promise.all([
    getCurrentUserContext(),
    sanityClient.fetch<DealListItem[]>(ACTIVE_DEALS_QUERY),
  ]);

  // Read fresh metadata so lock badges + purchased deals are up-to-date.
  let paid = ctx.isPaid;
  let purchasedSlugs: string[] = [];
  if (ctx.userId) {
    const freshUser = await clerkClient.users.getUser(ctx.userId);
    const freshMeta = (freshUser.publicMetadata ?? {}) as UserMetadata;
    if (!paid) paid = isPaidStatus(freshMeta);
    purchasedSlugs = (freshMeta.purchased_deals ?? []).map(
      (p: DealPurchase) => p.slug,
    );
  }

  return (
    <main>
      {!ctx.userId && <SubscriptionBanner />}

      <div className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:py-10">
          <h1 className="font-serif text-[28px] leading-[1.2] tracking-tight text-brand-navy sm:text-[32px]">
            Active Situations
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-[1.55] text-gray-600 sm:text-[15px]">
            Live M&amp;A situations — structured intelligence, regulatory
            timelines, and CTFN editorial analysis.
          </p>
        </div>
      </div>

      <FilterBar />

      <div className="mx-auto max-w-7xl">
        <DealGrid deals={deals} isPaid={paid} purchasedSlugs={purchasedSlugs} />
      </div>
    </main>
  );
}
