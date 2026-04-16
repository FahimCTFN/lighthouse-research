"use client";

import { useFilters, applyFilters } from "@/components/filters/useFilters";
import { DealCard } from "./DealCard";
import type { DealListItem } from "@/lib/sanity/types";

export function DealGrid({
  deals,
  isPaid,
  purchasedSlugs = [],
}: {
  deals: DealListItem[];
  isPaid: boolean;
  purchasedSlugs?: string[];
}) {
  const { filters } = useFilters();
  const visible = applyFilters(deals, filters);

  return (
    <div className="px-6 py-6 sm:py-8">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-[11px] font-medium uppercase tracking-label text-gray-500">
          {visible.length} {visible.length === 1 ? "situation" : "situations"}
        </span>
      </div>
      {visible.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white/60 px-6 py-16 text-center text-[13px] text-gray-500">
          No deals match the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((d) => (
            <DealCard
              key={d._id}
              deal={d}
              locked={!isPaid && !purchasedSlugs.includes(d.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
