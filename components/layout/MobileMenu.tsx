"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function MobileMenu() {
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
    <div ref={ref} className="relative sm:hidden">
      <button
        onClick={() => setOpen((x) => !x)}
        aria-label="Menu"
        className="flex h-10 w-10 items-center justify-center rounded-md text-white/70 hover:bg-white/10"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 overflow-hidden rounded-lg border border-white/10 bg-brand-navy shadow-xl">
          <nav className="flex flex-col py-2">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="px-4 py-3 text-[13px] font-medium text-white/80 hover:bg-white/10"
            >
              Active Situations
            </Link>
            <Link
              href="/calendar"
              onClick={() => setOpen(false)}
              className="px-4 py-3 text-[13px] text-white/60 hover:bg-white/10 hover:text-white/90"
            >
              Calendar
            </Link>
            <Link
              href="/archive"
              onClick={() => setOpen(false)}
              className="px-4 py-3 text-[13px] text-white/60 hover:bg-white/10 hover:text-white/90"
            >
              Archive
            </Link>
            <Link
              href="/subscribe"
              onClick={() => setOpen(false)}
              className="px-4 py-3 text-[13px] text-white/60 hover:bg-white/10 hover:text-white/90"
            >
              Pricing
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
