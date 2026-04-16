"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { DealListItem, DealStatus, Sector } from "@/lib/sanity/types";
import { daysUntil } from "@/lib/format";

export type SortKey = "updated" | "next_event" | "value" | "premium";

export interface FilterState {
  stages: DealStatus[];
  sectors: Sector[];
  daysWindow: number | null; // 7 / 14 / 30
  probMin: number;
  probMax: number;
  sort: SortKey;
}

const DEFAULTS: FilterState = {
  stages: [],
  sectors: [],
  daysWindow: null,
  probMin: 0,
  probMax: 100,
  sort: "next_event",
};

export function useFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: FilterState = useMemo(() => {
    const stages = (searchParams.get("stage") || "")
      .split(",")
      .filter(Boolean) as DealStatus[];
    const sectors = (searchParams.get("sector") || "")
      .split(",")
      .filter(Boolean) as Sector[];
    const days = searchParams.get("days");
    const pmin = searchParams.get("pmin");
    const pmax = searchParams.get("pmax");
    const sort = (searchParams.get("sort") || DEFAULTS.sort) as SortKey;
    return {
      stages,
      sectors,
      daysWindow: days ? Number(days) : null,
      probMin: pmin ? Number(pmin) : 0,
      probMax: pmax ? Number(pmax) : 100,
      sort,
    };
  }, [searchParams]);

  const update = useCallback(
    (patch: Partial<FilterState>) => {
      const next = { ...filters, ...patch };
      const params = new URLSearchParams();
      if (next.stages.length) params.set("stage", next.stages.join(","));
      if (next.sectors.length) params.set("sector", next.sectors.join(","));
      if (next.daysWindow) params.set("days", String(next.daysWindow));
      if (next.probMin > 0) params.set("pmin", String(next.probMin));
      if (next.probMax < 100) params.set("pmax", String(next.probMax));
      if (next.sort !== DEFAULTS.sort) params.set("sort", next.sort);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [filters, pathname, router],
  );

  return { filters, update };
}

export function applyFilters(
  deals: DealListItem[],
  f: FilterState,
): DealListItem[] {
  const filtered = deals.filter((d) => {
    if (f.stages.length && !f.stages.includes(d.status)) return false;
    if (f.sectors.length && !f.sectors.includes(d.sector)) return false;
    if (f.daysWindow != null) {
      const days = daysUntil(d.next_key_event_date);
      if (days == null || days > f.daysWindow || days < 0) return false;
    }
    const p = d.ctfn_closing_probability ?? 0;
    if (p < f.probMin || p > f.probMax) return false;
    return true;
  });

  filtered.sort((a, b) => {
    switch (f.sort) {
      case "updated":
        return (
          new Date(b._updatedAt).getTime() - new Date(a._updatedAt).getTime()
        );
      case "value":
        return (b.equity_value ?? 0) - (a.equity_value ?? 0);
      case "premium":
        return (b.premium ?? 0) - (a.premium ?? 0);
      case "next_event":
      default: {
        const ad = a.next_key_event_date
          ? new Date(a.next_key_event_date).getTime()
          : Infinity;
        const bd = b.next_key_event_date
          ? new Date(b.next_key_event_date).getTime()
          : Infinity;
        return ad - bd;
      }
    }
  });

  return filtered;
}
