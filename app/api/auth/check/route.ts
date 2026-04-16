import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import type { UserMetadata } from "@/lib/clerk/helpers";
import { isPaidStatus, setUserMetadata, addDealPurchase } from "@/lib/clerk/helpers";
import { getStripe } from "@/lib/stripe/client";

export async function GET(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ isPaid: false });
  }

  // Read FRESH metadata from Clerk API (not stale JWT).
  const user = await clerkClient.users.getUser(userId);
  const meta = (user.publicMetadata ?? {}) as UserMetadata;

  // Already paid — fast path.
  if (isPaidStatus(meta)) {
    return NextResponse.json({ isPaid: true });
  }

  // Not yet paid — check if a Stripe session_id was provided.
  // This handles the case where the webhook hasn't arrived yet (or never will).
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");
  const purchaseSlug = url.searchParams.get("purchase");

  if (sessionId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);

      // Verify the session belongs to this user and payment succeeded.
      if (
        session.payment_status === "paid" &&
        (session.client_reference_id === userId ||
          session.metadata?.clerkUserId === userId)
      ) {
        if (session.metadata?.type === "single_report" && session.metadata?.dealSlug) {
          // One-time deal purchase — add to purchased_deals
          await addDealPurchase(userId, session.metadata.dealSlug);
          return NextResponse.json({ isPaid: true, purchased: session.metadata.dealSlug });
        } else {
          // Subscription — activate fully
          await setUserMetadata(userId, {
            stripeSubscriptionStatus: "active",
            stripeCustomerId: (session.customer as string) ?? undefined,
            stripeSubscriptionId:
              (typeof session.subscription === "string"
                ? session.subscription
                : session.subscription?.id) ?? undefined,
          });
          return NextResponse.json({ isPaid: true });
        }
      }
    } catch (err) {
      console.error("[auth/check] Stripe session verification failed:", err);
    }
  }

  // Check if user has purchased this specific deal
  if (purchaseSlug) {
    const purchases = (meta.purchased_deals ?? []);
    const owns = purchases.some((p: { slug: string }) => p.slug === purchaseSlug);
    if (owns) return NextResponse.json({ isPaid: true, purchased: purchaseSlug });
  }

  return NextResponse.json({ isPaid: false });
}
