"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CalendarEvent } from "@/lib/calendar";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const SOURCE_DOT: Record<string, string> = {
  filing: "bg-brand-navy",
  vote: "bg-purple-500",
  deal: "bg-brand-gold",
};

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

export function MonthGrid({ events }: { events: CalendarEvent[] }) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Events indexed by date
  const byDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      if (e.isDone) continue;
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    }
    return map;
  }, [events]);

  // Build calendar grid
  const grid = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    // Monday = 0
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const cells: (number | null)[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [year, month]);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
    setSelectedDate(null);
  }
  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
    setSelectedDate(null);
  }
  function goToday() {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setSelectedDate(today);
  }

  const selectedEvents = selectedDate ? byDate.get(selectedDate) ?? [] : [];

  return (
    <div className="mt-6">
      {/* Legend */}
      <div className="mb-4 flex flex-wrap items-center gap-4 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand-navy" /> Regulatory
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-purple-500" /> Vote
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand-gold" /> Deal milestone
        </span>
      </div>

      {/* Month navigation */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded border border-gray-200 bg-white px-2.5 py-1 text-[12px] hover:border-brand-navy"
        >
          ← Prev
        </button>
        <div className="text-center">
          <h2 className="text-[16px] font-semibold text-brand-navy">
            {MONTHS[month]} {year}
          </h2>
          <button
            onClick={goToday}
            className="text-[11px] text-gray-500 hover:text-brand-navy hover:underline"
          >
            Go to today
          </button>
        </div>
        <button
          onClick={nextMonth}
          className="rounded border border-gray-200 bg-white px-2.5 py-1 text-[12px] hover:border-brand-navy"
        >
          Next →
        </button>
      </div>

      {/* Grid */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {DAYS.map((d) => (
            <div
              key={d}
              className="px-1 py-2 text-center text-[10px] font-medium uppercase tracking-label text-gray-500"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {grid.map((day, i) => {
            if (day === null) {
              return (
                <div key={`empty-${i}`} className="border-b border-r border-gray-100 bg-gray-50/30 p-1" style={{ minHeight: 72 }} />
              );
            }
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = byDate.get(dateStr) ?? [];
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            const isPast = dateStr < today;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`border-b border-r border-gray-100 p-1 text-left transition ${
                  isSelected
                    ? "bg-brand-gold-light ring-1 ring-brand-gold"
                    : isToday
                      ? "bg-brand-gold-light/30"
                      : isPast
                        ? "bg-gray-50/50"
                        : "bg-white hover:bg-gray-50"
                }`}
                style={{ minHeight: 72 }}
              >
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-medium ${
                    isToday
                      ? "bg-brand-navy text-white"
                      : isPast
                        ? "text-gray-400"
                        : "text-brand-navy"
                  }`}
                >
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <div className="mt-0.5 flex flex-wrap gap-[2px]">
                    {dayEvents.slice(0, 4).map((e, j) => (
                      <span
                        key={j}
                        className={`h-1.5 w-1.5 rounded-full ${SOURCE_DOT[e.source] ?? "bg-gray-400"}`}
                        title={`${e.dealTarget}: ${e.label}`}
                      />
                    ))}
                    {dayEvents.length > 4 && (
                      <span className="text-[8px] text-gray-400">
                        +{dayEvents.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDate && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white">
          <header className="border-b border-gray-100 px-4 py-2.5">
            <h3 className="text-[13px] font-semibold text-brand-navy">
              {new Date(selectedDate + "T00:00:00Z").toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              })}
            </h3>
          </header>
          {selectedEvents.length === 0 ? (
            <div className="px-4 py-6 text-center text-[13px] text-gray-500">
              No events on this day.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {selectedEvents.map((ev, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${SOURCE_DOT[ev.source] ?? "bg-gray-400"}`}
                  />
                  <Link
                    href={`/deals/${ev.dealSlug}`}
                    className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-label ${
                      SECTOR_COLORS[ev.sector] ?? SECTOR_COLORS.other
                    }`}
                  >
                    {ev.targetTicker || ev.dealTarget.slice(0, 8)}
                  </Link>
                  <span className="shrink-0 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                    {ev.regulator}
                  </span>
                  <span className="min-w-0 flex-1 text-[13px] text-ink">
                    {ev.label}
                  </span>
                  <Link
                    href={`/deals/${ev.dealSlug}`}
                    className="shrink-0 text-[11px] font-medium text-brand-navy hover:underline"
                  >
                    View →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
