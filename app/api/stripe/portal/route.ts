import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createBillingPortalSession } from "@/lib/stripe/helpers";
import type { UserMetadata } from "@/lib/clerk/helpers";

export async function POST() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const user = await clerkClient.users.getUser(userId);
  const meta = (user.publicMetadata ?? {}) as UserMetadata;
  if (!meta.stripeCustomerId) {
    return NextResponse.json(
      { error: "no stripe customer" },
      { status: 400 },
    );
  }
  const session = await createBillingPortalSession(
    meta.stripeCustomerId,
    `${process.env.NEXT_PUBLIC_APP_URL}/account`,
  );
  return NextResponse.json({ url: session.url });
}
