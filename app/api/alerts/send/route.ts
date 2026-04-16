import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { sanityServerClient } from "@/lib/sanity/client";
import { DEAL_BY_SLUG_LIGHT_QUERY } from "@/lib/sanity/queries";
import { sendWatchlistAlert } from "@/lib/email/sendAlert";
import type { UserMetadata } from "@/lib/clerk/helpers";
import { isPaidStatus } from "@/lib/clerk/helpers";

export const runtime = "nodejs";

interface SanityWebhookPayload {
  slug?: string;
  trigger_alert?: boolean;
  alert_summary?: string;
}

export async function POST(req: Request) {
  // Verify Sanity webhook secret (header `sanity-webhook-secret` per our config)
  const secret =
    req.headers.get("sanity-webhook-secret") ||
    req.headers.get("x-sanity-webhook-secret");
  if (!secret || secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "invalid secret" }, { status: 401 });
  }

  const payload = (await req.json().catch(() => ({}))) as SanityWebhookPayload;
  const slug = payload.slug;
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  // Bust ISR for the deal page + index
  revalidatePath(`/deals/${slug}`);
  revalidatePath("/");

  // If alert is not requested, we're done after revalidation.
  if (!payload.trigger_alert) {
    return NextResponse.json({ ok: true, alerted: 0, revalidated: true });
  }

  // Auto-stamp last_material_update — re-locks one-time buyers whose
  // purchase predates this update. Same action that triggers watchlist
  // emails also invalidates stale single-report access.
  await sanityServerClient
    .patch(`deal-${slug}`)
    .set({ last_material_update: new Date().toISOString() })
    .commit();

  const deal = await sanityServerClient.fetch<{
    acquirer: string;
    target: string;
    slug: string;
    alert_summary?: string;
  } | null>(DEAL_BY_SLUG_LIGHT_QUERY, { slug });
  if (!deal) {
    return NextResponse.json({ error: "deal not found" }, { status: 404 });
  }

  const summary = payload.alert_summary || deal.alert_summary || "";
  if (!summary) {
    return NextResponse.json(
      { error: "alert_summary required" },
      { status: 400 },
    );
  }

  // Find paid users whose watchlist contains the slug.
  const recipients: string[] = [];
  let offset = 0;
  const limit = 200;
  // Paginate through all users — V1 acceptable; replace with index later.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, totalCount } = await clerkClient.users.getUserList({
      limit,
      offset,
    });
    for (const u of data) {
      const meta = (u.publicMetadata ?? {}) as UserMetadata;
      if (!isPaidStatus(meta)) continue;
      if (!meta.watchlist?.includes(slug)) continue;
      const email = u.primaryEmailAddress?.emailAddress;
      if (email) recipients.push(email);
    }
    offset += data.length;
    if (offset >= totalCount || data.length === 0) break;
  }

  // Send (best-effort, fire in parallel with limited concurrency)
  const results = await Promise.allSettled(
    recipients.map((to) =>
      sendWatchlistAlert({
        to,
        acquirer: deal.acquirer,
        target: deal.target,
        slug: deal.slug,
        summary,
      }),
    ),
  );
  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - sent;

  return NextResponse.json({ ok: true, alerted: sent, failed });
}
