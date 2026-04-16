"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function FilterPopover({
  label,
  summary,
  active = false,
  children,
  align = "left",
}: {
  label: string;
  summary: string;
  active?: boolean;
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((x) => !x)}
        className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] transition ${
          active
            ? "border-brand-navy bg-brand-navy text-white hover:bg-brand-navy-dark"
            : "border-gray-300 bg-white text-gray-700 hover:border-brand-navy hover:text-brand-navy"
        }`}
      >
        <span
          className={`text-[10px] font-medium uppercase tracking-label ${
            active ? "text-white/70" : "text-gray-500"
          }`}
        >
          {label}
        </span>
        <span className="font-medium">{summary}</span>
        <svg
          aria-hidden
          width="10"
          height="10"
          viewBox="0 0 10 10"
          className={`transition ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M2 4l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div
          className={`absolute top-[calc(100%+6px)] z-30 w-64 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
          role="dialog"
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
