import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserWatchlist, setUserMetadata } from "@/lib/clerk/helpers";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }
  const current = await getUserWatchlist(userId);
  if (!current.includes(slug)) {
    await setUserMetadata(userId, { watchlist: [...current, slug] });
  }
  return NextResponse.json({ ok: true });
}
