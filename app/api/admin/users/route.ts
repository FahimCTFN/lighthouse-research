import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import type { UserMetadata } from "@/lib/clerk/helpers";
import { isPaidStatus } from "@/lib/clerk/helpers";

async function requireAdmin() {
  const { userId, sessionClaims } = auth();
  const meta = (sessionClaims?.metadata ?? {}) as UserMetadata;
  if (!userId || meta.role !== "admin") return null;
  return userId;
}

export async function GET(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() || "";
  const filter = url.searchParams.get("filter") || "all";
  const limit = Math.min(Number(url.searchParams.get("limit") || 100), 200);
  const offset = Number(url.searchParams.get("offset") || 0);

  const { data, totalCount } = await clerkClient.users.getUserList({
    limit,
    offset,
    orderBy: "-created_at",
    query: q || undefined,
  });

  const rows = data
    .map((u) => {
      const meta = (u.publicMetadata ?? {}) as UserMetadata;
      return {
        id: u.id,
        email: u.primaryEmailAddress?.emailAddress ?? "",
        name: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim(),
        createdAt: new Date(u.createdAt).toISOString(),
        lastSignInAt: u.lastSignInAt
          ? new Date(u.lastSignInAt).toISOString()
          : null,
        role: meta.role ?? null,
        status: meta.stripeSubscriptionStatus ?? "free",
        isPaid: isPaidStatus(meta),
        manualGrant: !!meta.manualAccessGrant,
        manualExpiry: meta.manualAccessExpiry ?? null,
        stripeCustomerId: meta.stripeCustomerId ?? null,
        watchlistCount: meta.watchlist?.length ?? 0,
      };
    })
    .filter((u) => {
      switch (filter) {
        case "paid":
          return u.isPaid;
        case "free":
          return !u.isPaid;
        case "admin":
          return u.role === "admin";
        case "editor":
          return u.role === "editor";
        case "manual":
          return u.manualGrant;
        default:
          return true;
      }
    });

  return NextResponse.json({ users: rows, totalCount });
}
