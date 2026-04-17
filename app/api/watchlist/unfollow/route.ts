import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserWatchlist, setUserMetadata } from "@/lib/clerk/helpers";
import { isValidSlug } from "@/lib/security";

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
  await setUserMetadata(userId, {
    watchlist: current.filter((s) => s !== slug),
  });
  return NextResponse.json({ ok: true });
}
