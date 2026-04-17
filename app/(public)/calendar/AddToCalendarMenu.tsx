"use client";

import { useEffect, useRef, useState } from "react";
import type { CalendarEvent } from "@/lib/calendar";
import { googleCalendarUrl, outlookCalendarUrl } from "@/lib/calendar";

export function AddToCalendarMenu({
  event,
  onDownloadICS,
}: {
  event: CalendarEvent;
  onDownloadICS: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((x) => !x)}
        title="Add to calendar"
        className="rounded border border-gray-200 bg-white p-1 text-gray-500 transition hover:border-brand-navy hover:text-brand-navy"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <rect
            x="2"
            y="3"
            width="12"
            height="11"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <path d="M2 6.5h12" stroke="currentColor" strokeWidth="1.3" />
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
      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-30 w-48 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
          <a
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
              <rect x="1" y="1" width="14" height="14" rx="2" fill="#4285F4" />
              <rect x="3" y="3" width="10" height="10" rx="1" fill="white" />
              <path d="M5 6h6M5 8h4M5 10h5" stroke="#4285F4" strokeWidth="1" strokeLinecap="round" />
            </svg>
            Google Calendar
          </a>
          <a
            href={outlookCalendarUrl(event)}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 border-t border-gray-100 px-3 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
              <rect x="1" y="1" width="14" height="14" rx="2" fill="#0078D4" />
              <rect x="3" y="4" width="10" height="9" rx="1" fill="white" />
              <path d="M3 6.5h10" stroke="#0078D4" strokeWidth="0.8" />
              <path d="M6 4v2M10 4v2" stroke="#0078D4" strokeWidth="0.8" strokeLinecap="round" />
            </svg>
            Outlook Calendar
          </a>
          <button
            onClick={() => {
              onDownloadICS();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2.5 text-[12px] text-gray-700 hover:bg-gray-50"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0" fill="none">
              <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1" />
              <path d="M8 5v5M6 8l2 2 2-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Download .ics file
          </button>
        </div>
      )}
    </div>
  );
}
