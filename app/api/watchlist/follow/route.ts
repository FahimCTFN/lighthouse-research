import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserWatchlist, setUserMetadata } from "@/lib/clerk/helpers";
import { isValidSlug, MAX_WATCHLIST_SIZE } from "@/lib/security";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!slug || !isValidSlug(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }
  const current = await getUserWatchlist(userId);
  if (current.includes(slug)) {
    return NextResponse.json({ ok: true });
  }
  if (current.length >= MAX_WATCHLIST_SIZE) {
    return NextResponse.json(
      { error: `watchlist limit (${MAX_WATCHLIST_SIZE}) reached` },
      { status: 400 },
    );
  }
  await setUserMetadata(userId, { watchlist: [...current, slug] });
  return NextResponse.json({ ok: true });
}
