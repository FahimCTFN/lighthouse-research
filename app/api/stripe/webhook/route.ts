import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { setUserMetadata } from "@/lib/clerk/helpers";
import type { SubStatus } from "@/lib/clerk/helpers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text(); // raw text required for signature verification
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    return NextResponse.json(
      { error: `invalid signature: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const clerkUserId = (sub.metadata.clerkUserId as string) || "";
        if (!clerkUserId) break;
        const status: SubStatus =
          sub.status === "active" || sub.status === "trialing"
            ? "active"
            : sub.status === "past_due"
              ? "past_due"
              : sub.status === "canceled" || sub.status === "incomplete_expired"
                ? "cancelled"
                : "none";
        await setUserMetadata(clerkUserId, {
          stripeSubscriptionStatus: status,
          stripeSubscriptionId: sub.id,
          stripeCustomerId: sub.customer as string,
        });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const clerkUserId = (sub.metadata.clerkUserId as string) || "";
        if (!clerkUserId) break;
        await setUserMetadata(clerkUserId, {
          stripeSubscriptionStatus: "cancelled",
        });
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;
        if (!subId) break;
        const sub = await getStripe().subscriptions.retrieve(subId);
        const clerkUserId = (sub.metadata.clerkUserId as string) || "";
        if (clerkUserId) {
          await setUserMetadata(clerkUserId, {
            stripeSubscriptionStatus: "past_due",
          });
        }
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clerkUserId =
          (session.metadata?.clerkUserId as string) ||
          (session.client_reference_id as string) ||
          "";
        if (clerkUserId && session.customer) {
          await setUserMetadata(clerkUserId, {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionStatus: "active",
          });
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe webhook] handler error", err);
    return NextResponse.json({ error: "handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
