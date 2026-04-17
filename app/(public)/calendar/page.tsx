import Link from "next/link";
import { clerkClient } from "@clerk/nextjs/server";
import { sanityClient } from "@/lib/sanity/client";
import { CALENDAR_DEALS_QUERY } from "@/lib/sanity/queries";
import { aggregateEvents } from "@/lib/calendar";
import { getCurrentUserContext, isPaidStatus } from "@/lib/clerk/helpers";
import type { UserMetadata } from "@/lib/clerk/helpers";
import { CalendarWrapper } from "./CalendarWrapper";
import { formatDate } from "@/lib/format";

export const revalidate = 60;

const SECTOR_COLORS: Record<string, string> = {
  technology: "bg-blue-100 text-blue-800",
  healthcare: "bg-green-100 text-green-800",
  energy: "bg-amber-100 text-amber-800",
  consumer: "bg-pink-100 text-pink-800",
  industrials: "bg-slate-100 text-slate-800",
  media_telecom: "bg-purple-100 text-purple-800",
  financial_services: "bg-cyan-100 text-cyan-800",
  other: "bg-gray-100 text-gray-700",
};

export default async function CalendarPage() {
  const ctx = await getCurrentUserContext();

  // Fresh metadata check (same pattern as deal pages)
  let isPro = ctx.isPaid;
  if (ctx.userId && !isPro) {
    const freshUser = await clerkClient.users.getUser(ctx.userId);
    const freshMeta = (freshUser.publicMetadata ?? {}) as UserMetadata;
    isPro = isPaidStatus(freshMeta);
  }

  const deals = await sanityClient.fetch(CALENDAR_DEALS_QUERY);
  const events = aggregateEvents(deals);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => !e.isDone && e.date >= today);
  const thisWeek = upcoming.filter((e) => {
    const diff =
      (new Date(e.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });
  const next30 = upcoming.filter((e) => {
    const diff =
      (new Date(e.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  });

  // Preview: show first 5 upcoming events for non-subscribers
  const previewEvents = upcoming.slice(0, 5);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="border-b border-gray-200 pb-6">
        <div className="text-[11px] font-medium uppercase tracking-label text-gray-500">
          Event Calendar
        </div>
        <h1 className="mt-1 font-serif text-[28px] leading-[1.25] tracking-tight text-brand-navy">
          Upcoming events
        </h1>
        <p className="mt-1 text-[13px] text-gray-600">
          Regulatory filings, shareholder votes, outside dates, and CTFN
          closing estimates across all active situations.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Stat label="This week" value={thisWeek.length} />
          <Stat label="Next 30 days" value={next30.length} />
          <Stat label="Total upcoming" value={upcoming.length} />
          <Stat label="Active deals" value={deals.length} />
        </div>
      </header>

      {isPro ? (
        <CalendarWrapper events={events} />
      ) : (
        <div className="mt-6">
          {/* Preview with progressive blur */}
          <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="divide-y divide-gray-100">
              {previewEvents.map((ev, i) => (
                <div
                  key={`${ev.dealSlug}-${ev.date}-${i}`}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{
                    filter: i >= 3 ? `blur(${(i - 2) * 2}px)` : undefined,
                    opacity: i >= 3 ? 1 - (i - 2) * 0.15 : 1,
                  }}
                >
                  <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold" />
                  <span className="shrink-0 text-[12px] tabular-nums text-gray-600">
                    {formatDate(ev.date)}
                  </span>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-label ${
                      SECTOR_COLORS[ev.sector] ?? SECTOR_COLORS.other
                    }`}
                  >
                    {ev.targetTicker || ev.dealTarget.slice(0, 8)}
                  </span>
                  <span className="shrink-0 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                    {ev.regulator}
                  </span>
                  <span className="min-w-0 flex-1 text-[13px] text-ink">
                    {ev.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Gradient overlay fading to paper background */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 0%, rgba(250,248,242,0.6) 40%, rgba(250,248,242,0.95) 80%, rgb(250,248,242) 100%)",
              }}
            />
          </div>

          {/* Subscribe prompt */}
          <div className="mt-6 rounded-lg border border-brand-gold/40 bg-brand-gold-light/30 px-8 py-8 text-center">
            <div className="text-[10px] font-medium uppercase tracking-label text-brand-gold-ink">
              Pro feature
            </div>
            <h3 className="mt-1 font-serif text-[20px] text-brand-navy">
              Unlock the full Event Calendar
            </h3>
            <p className="mx-auto mt-2 max-w-md text-[13px] leading-[1.6] text-gray-600">
              {upcoming.length} upcoming events across {deals.length} active
              deals — regulatory deadlines, shareholder votes, outside dates,
              and CTFN closing estimates. Filter by deal, regulator, or time
              window. Add events directly to Google Calendar or Outlook.
            </p>
            <ul className="mx-auto mt-4 max-w-xs space-y-1.5 text-left">
              {[
                "Full agenda + monthly calendar views",
                "Filter by deal, regulator, time window",
                "One-click add to Google Calendar / Outlook",
                "Outside dates + CTFN closing estimates",
                "Real-time updates as deals progress",
              ].map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-[12px] leading-[1.5] text-gray-700"
                >
                  <span className="mt-[5px] block h-1 w-1 shrink-0 rounded-full bg-brand-gold" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col items-center gap-2">
              <Link
                href="/subscribe"
                className="rounded bg-brand-navy px-8 py-2.5 text-[13px] font-medium text-white hover:bg-brand-navy-dark"
              >
                Subscribe — $499/mo
              </Link>
              {!ctx.userId && (
                <Link
                  href="/sign-in"
                  className="text-[12px] text-gray-500 hover:text-brand-navy"
                >
                  Already a member? Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2">
      <div className="text-[10px] font-medium uppercase tracking-label text-gray-500">
        {label}
      </div>
      <div className="text-[18px] font-semibold tabular-nums text-brand-navy">
        {value}
      </div>
    </div>
  );
}
