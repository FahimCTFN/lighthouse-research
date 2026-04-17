"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CalendarEvent } from "@/lib/calendar";
import { generateICS } from "@/lib/calendar";
import { formatSector } from "@/lib/format";

const TIME_WINDOWS = [
  { label: "This week", days: 7 },
  { label: "2 weeks", days: 14 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "All", days: 9999 },
];

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

export function CalendarView({ events }: { events: CalendarEvent[] }) {
  const [window, setWindow] = useState(30);
  const [showPast, setShowPast] = useState(false);
  const [dealFilter, setDealFilter] = useState<string | null>(null);
  const [regFilter, setRegFilter] = useState<string | null>(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const cutoff = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + window);
    return d.toISOString().slice(0, 10);
  }, [window]);

  // Unique values for filters
  const deals = useMemo(
    () =>
      [...new Set(events.map((e) => e.dealSlug))].map((slug) => {
        const ev = events.find((e) => e.dealSlug === slug)!;
        return { slug, label: `${ev.dealTarget} / ${ev.dealAcquirer}` };
      }),
    [events],
  );
  const regulators = useMemo(
    () => [...new Set(events.map((e) => e.regulator))].sort(),
    [events],
  );

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (!showPast && e.isDone) return false;
      if (!showPast && e.date < today) return false;
      if (e.date > cutoff) return false;
      if (dealFilter && e.dealSlug !== dealFilter) return false;
      if (regFilter && e.regulator !== regFilter) return false;
      return true;
    });
  }, [events, showPast, today, cutoff, dealFilter, regFilter]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of filtered) {
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    }
    return [...map.entries()];
  }, [filtered]);

  function downloadICS(event: CalendarEvent) {
    const content = generateICS(event);
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.dealSlug}-${event.date}-${event.regulator}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4">
        {/* Time window */}
        <div className="flex overflow-hidden rounded-md border border-gray-200 text-[11px]">
          {TIME_WINDOWS.map((w) => (
            <button
              key={w.days}
              onClick={() => setWindow(w.days)}
              className={`px-2.5 py-1.5 ${
                window === w.days
                  ? "bg-brand-navy text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              } ${w.days !== 7 ? "border-l border-gray-200" : ""}`}
            >
              {w.label}
            </button>
          ))}
        </div>

        {/* Deal filter */}
        <select
          value={dealFilter ?? ""}
          onChange={(e) => setDealFilter(e.target.value || null)}
          className="h-8 rounded-md border border-gray-200 bg-white px-2 text-[11px]"
        >
          <option value="">All deals</option>
          {deals.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.label}
            </option>
          ))}
        </select>

        {/* Regulator filter */}
        <select
          value={regFilter ?? ""}
          onChange={(e) => setRegFilter(e.target.value || null)}
          className="h-8 rounded-md border border-gray-200 bg-white px-2 text-[11px]"
        >
          <option value="">All regulators</option>
          {regulators.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <label className="ml-auto flex items-center gap-1.5 text-[11px] text-gray-500">
          <input
            type="checkbox"
            checked={showPast}
            onChange={(e) => setShowPast(e.target.checked)}
            className="rounded border-gray-300"
          />
          Show past events
        </label>
      </div>

      {/* Agenda */}
      {grouped.length === 0 ? (
        <div className="py-16 text-center text-[13px] text-gray-500">
          No events in this time window.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {grouped.map(([date, dayEvents]) => {
            const isToday = date === today;
            const isPast = date < today;
            const dateObj = new Date(date + "T00:00:00Z");
            const dayName = dateObj.toLocaleDateString("en-US", {
              weekday: "long",
              timeZone: "UTC",
            });
            const dateStr = dateObj.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            });

            return (
              <div key={date} className={isToday ? "bg-brand-gold-light/30" : ""}>
                {/* Date header */}
                <div
                  className={`sticky top-14 z-10 flex items-center gap-3 px-4 py-2 ${
                    isToday
                      ? "border-l-[3px] border-brand-gold bg-brand-gold-light/50"
                      : isPast
                        ? "bg-gray-50"
                        : "bg-paper"
                  }`}
                >
                  <span
                    className={`text-[13px] font-semibold ${
                      isToday
                        ? "text-brand-gold-ink"
                        : isPast
                          ? "text-gray-400"
                          : "text-brand-navy"
                    }`}
                  >
                    {isToday ? "TODAY · " : ""}
                    {dayName}, {dateStr}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {dayEvents.length}{" "}
                    {dayEvents.length === 1 ? "event" : "events"}
                  </span>
                </div>

                {/* Events for this date */}
                {dayEvents.map((ev, i) => (
                  <div
                    key={`${ev.dealSlug}-${ev.regulator}-${i}`}
                    className={`flex items-center gap-3 px-4 py-2.5 ${
                      isPast || ev.isDone ? "opacity-60" : ""
                    }`}
                  >
                    {/* Done indicator */}
                    <span className="w-4 shrink-0 text-center">
                      {ev.isDone ? (
                        <span className="text-[10px] text-green-600">✓</span>
                      ) : (
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-gold" />
                      )}
                    </span>

                    {/* Deal pill */}
                    <Link
                      href={`/deals/${ev.dealSlug}`}
                      className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-label ${
                        SECTOR_COLORS[ev.sector] ?? SECTOR_COLORS.other
                      }`}
                    >
                      {ev.targetTicker || ev.dealTarget.slice(0, 8)}
                    </Link>

                    {/* Regulator badge */}
                    <span className="shrink-0 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                      {ev.regulator}
                    </span>

                    {/* Label */}
                    <span
                      className={`min-w-0 flex-1 text-[13px] ${
                        ev.isDone ? "text-gray-500" : "text-ink"
                      }`}
                    >
                      {ev.label}
                      {ev.note && (
                        <span className="ml-1 text-[11px] text-gray-500">
                          — {ev.note}
                        </span>
                      )}
                    </span>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1.5">
                      {!ev.isDone && (
                        <button
                          onClick={() => downloadICS(ev)}
                          title="Add to calendar"
                          className="rounded border border-gray-200 bg-white p-1 text-[10px] text-gray-500 transition hover:border-brand-navy hover:text-brand-navy"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <rect
                              x="2"
                              y="3"
                              width="12"
                              height="11"
                              rx="1.5"
                              stroke="currentColor"
                              strokeWidth="1.3"
                            />
                            <path
                              d="M2 6.5h12"
                              stroke="currentColor"
                              strokeWidth="1.3"
                            />
                            <path
                              d="M5 1.5v3M11 1.5v3"
                              stroke="currentColor"
                              strokeWidth="1.3"
                              strokeLinecap="round"
                            />
                            <path
                              d="M8 9v3M6.5 10.5h3"
                              stroke="currentColor"
                              strokeWidth="1.3"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      )}
                      <Link
                        href={`/deals/${ev.dealSlug}`}
                        className="text-[11px] font-medium text-brand-navy hover:underline"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
