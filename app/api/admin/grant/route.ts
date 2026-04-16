import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { setUserMetadata } from "@/lib/clerk/helpers";
import type { UserMetadata } from "@/lib/clerk/helpers";

export async function POST(req: Request) {
  const { userId, sessionClaims } = auth();
  const meta = (sessionClaims?.metadata ?? {}) as UserMetadata;
  if (!userId || meta.role !== "admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { userId: targetId, expiry } = (await req.json().catch(() => ({}))) as {
    userId?: string;
    expiry?: string;
  };
  if (!targetId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  await setUserMetadata(targetId, {
    stripeSubscriptionStatus: "active",
    manualAccessGrant: true,
    manualAccessExpiry: expiry,
  });
  return NextResponse.json({ ok: true });
}
