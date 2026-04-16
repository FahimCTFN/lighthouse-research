import { getStripe } from "./client";

export async function createCheckoutSession(opts: {
  clerkUserId: string;
  email: string;
  returnUrl: string;
}) {
  return getStripe().checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: opts.email,
    line_items: [{ price: process.env.STRIPE_PAID_PRICE_ID!, quantity: 1 }],
    success_url: `${opts.returnUrl}?checkout=success`,
    cancel_url: `${opts.returnUrl}?checkout=cancelled`,
    client_reference_id: opts.clerkUserId,
    metadata: { clerkUserId: opts.clerkUserId },
    subscription_data: { metadata: { clerkUserId: opts.clerkUserId } },
  });
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string,
) {
  return getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
