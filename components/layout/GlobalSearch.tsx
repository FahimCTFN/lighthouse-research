"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { STAGE_LABEL } from "@/lib/format";
import type { DealStatus } from "@/lib/sanity/types";

interface SearchDeal {
  slug: string;
  acquirer: string;
  target: string;
  acquirer_ticker?: string;
  target_ticker?: string;
  status: DealStatus;
  sector: string;
}

export function GlobalSearch() {
  const router = useRouter();
  const [deals, setDeals] = useState<SearchDeal[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const loadedRef = useRef(false);

  // Lazy-load the deal list on first focus. It's small; one fetch is enough.
  const loadOnce = useCallback(async () => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    try {
      const res = await fetch("/api/search");
      const data = await res.json();
      setDeals(data.deals ?? []);
    } catch {
      loadedRef.current = false; // allow retry on next focus
    }
  }, []);

  // ⌘/Ctrl + K to focus; Esc to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Click outside to close
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results = useMemo<SearchDeal[]>(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return deals.slice(0, 6);
    const score = (d: SearchDeal) => {
      const hay = [
        d.acquirer,
        d.target,
        d.acquirer_ticker,
        d.target_ticker,
        `${d.acquirer_ticker ?? ""} / ${d.target_ticker ?? ""}`,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(needle)) return -1;
      // Prefer ticker-exact, then prefix matches
      let s = 0;
      if (d.acquirer_ticker?.toLowerCase() === needle) s += 10;
      if (d.target_ticker?.toLowerCase() === needle) s += 10;
      if (d.acquirer.toLowerCase().startsWith(needle)) s += 5;
      if (d.target.toLowerCase().startsWith(needle)) s += 5;
      return s;
    };
    return deals
      .map((d) => ({ d, s: score(d) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 6)
      .map((x) => x.d);
  }, [deals, q]);

  useEffect(() => {
    if (activeIndex >= results.length) setActiveIndex(0);
  }, [results.length, activeIndex]);

  function go(deal: SearchDeal) {
    setOpen(false);
    setQ("");
    router.push(`/deals/${deal.slug}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const target = results[activeIndex];
      if (target) go(target);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center rounded border border-white/15 bg-white/10 focus-within:border-brand-gold/60 focus-within:bg-white/15">
        <svg
          aria-hidden
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          className="ml-2 text-white/55"
        >
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M11 11l3 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            loadOnce();
          }}
          onKeyDown={onKeyDown}
          placeholder="Search deals or tickers…"
          className="w-36 bg-transparent px-2 py-1.5 text-[12px] text-white placeholder-white/50 focus:outline-none sm:w-48"
        />
        <kbd className="mr-2 hidden rounded border border-white/15 px-1 text-[9px] uppercase tracking-wider text-white/45 sm:inline">
          ⌘K
        </kbd>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg sm:left-auto sm:right-0 sm:w-96">
          {results.length === 0 ? (
            <div className="px-4 py-5 text-center text-xs text-gray-500">
              {deals.length === 0
                ? "Loading…"
                : `No deals match "${q}"`}
            </div>
          ) : (
            <ul>
              {results.map((d, i) => {
                const tickers = [d.acquirer_ticker, d.target_ticker]
                  .filter(Boolean)
                  .join(" / ");
                const active = i === activeIndex;
                return (
                  <li key={d.slug}>
                    <Link
                      href={`/deals/${d.slug}`}
                      onClick={() => {
                        setOpen(false);
                        setQ("");
                      }}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm ${
                        active ? "bg-brand-gold-light" : "bg-white"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-brand-navy">
                          {d.acquirer} <span className="text-gray-400">/</span>{" "}
                          {d.target}
                        </span>
                        <span className="block text-[10px] uppercase tracking-label text-gray-500">
                          {tickers ? `${tickers} · ` : ""}
                          {STAGE_LABEL[d.status] ?? d.status}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
