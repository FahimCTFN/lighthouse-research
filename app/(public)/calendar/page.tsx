import { sanityClient } from "@/lib/sanity/client";
import { CALENDAR_DEALS_QUERY } from "@/lib/sanity/queries";
import { aggregateEvents } from "@/lib/calendar";
import { CalendarWrapper } from "./CalendarWrapper";

export const revalidate = 60;

export default async function CalendarPage() {
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

      <CalendarWrapper events={events} />
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
