"use client";

import { useState } from "react";
import type { CalendarEvent } from "@/lib/calendar";
import { CalendarView } from "./CalendarView";
import { MonthGrid } from "./MonthGrid";

export function CalendarWrapper({ events }: { events: CalendarEvent[] }) {
  const [view, setView] = useState<"agenda" | "calendar">("agenda");

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <div className="flex overflow-hidden rounded-md border border-gray-200 text-[12px]">
          <button
            onClick={() => setView("agenda")}
            className={`flex items-center gap-1.5 px-3 py-1.5 ${
              view === "agenda"
                ? "bg-brand-navy text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 4h10M3 8h7M3 12h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            Agenda
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`flex items-center gap-1.5 border-l border-gray-200 px-3 py-1.5 ${
              view === "calendar"
                ? "bg-brand-navy text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M2 6.5h12" stroke="currentColor" strokeWidth="1.3" />
              <path d="M5 1.5v3M11 1.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            Calendar
          </button>
        </div>
      </div>

      {view === "agenda" ? (
        <CalendarView events={events} />
      ) : (
        <MonthGrid events={events} />
      )}
    </div>
  );
}
