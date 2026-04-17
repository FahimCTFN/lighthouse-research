import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getStripe } from "@/lib/stripe/client";
import { sanityClient } from "@/lib/sanity/client";
import { groq } from "next-sanity";

const DEAL_PURCHASE_QUERY = groq`
  *[_type == "deal" && slug.current == $slug][0] {
    acquirer,
    target,
    allow_single_purchase,
    single_purchase_price
  }
`;

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  if (!email) {
    return NextResponse.json({ error: "no email on file" }, { status: 400 });
  }

  const { slug, returnUrl } = (await req.json().catch(() => ({}))) as {
    slug?: string;
    returnUrl?: string;
  };
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  // Verify the deal allows single purchase
  const deal = await sanityClient.fetch<{
    acquirer: string;
    target: string;
    allow_single_purchase: boolean;
    single_purchase_price?: number;
  } | null>(DEAL_PURCHASE_QUERY, { slug });

  if (!deal || !deal.allow_single_purchase) {
    return NextResponse.json(
      { error: "single purchase not available for this deal" },
      { status: 400 },
    );
  }

  const price = deal.single_purchase_price ?? 89;
  const fallback = `${process.env.NEXT_PUBLIC_APP_URL}/deals/${slug}`;

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: price * 100,
          product_data: {
            name: `${deal.target} / ${deal.acquirer} — Situation Report`,
            description: "One-time access to this deal's full intelligence report.",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${returnUrl || fallback}?checkout=success&session_id={CHECKOUT_SESSION_ID}&purchase=${slug}`,
    cancel_url: `${returnUrl || fallback}?checkout=cancelled`,
    client_reference_id: userId,
    metadata: { clerkUserId: userId, dealSlug: slug, type: "single_report" },
  });

  return NextResponse.json({ url: session.url });
}
