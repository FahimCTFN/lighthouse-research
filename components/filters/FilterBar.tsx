"use client";

import { useFilters, type SortKey } from "./useFilters";
import { FilterPopover } from "./FilterPopover";
import type { DealStatus, Sector } from "@/lib/sanity/types";
import { STAGE_LABEL, SECTOR_LABEL } from "@/lib/format";

const STAGES: DealStatus[] = [
  "pre_event",
  "ongoing",
  "closed",
  "terminated",
];

const SECTORS: Sector[] = [
  "technology",
  "healthcare",
  "financial_services",
  "energy",
  "consumer",
  "industrials",
  "media_telecom",
  "other",
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "next_event", label: "Next event (soonest)" },
  { value: "updated", label: "Most recently updated" },
  { value: "value", label: "Deal value (largest)" },
  { value: "premium", label: "Premium (highest)" },
];

const EVENT_WINDOWS = [7, 14, 30] as const;

export function FilterBar() {
  const { filters, update } = useFilters();

  function toggle<T extends string>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
  }

  const hasActive =
    filters.stages.length > 0 ||
    filters.sectors.length > 0 ||
    filters.daysWindow != null ||
    filters.probMin > 0 ||
    filters.sort !== "next_event";

  function reset() {
    update({
      stages: [],
      sectors: [],
      daysWindow: null,
      probMin: 0,
      probMax: 100,
      sort: "next_event",
    });
  }

  const stageSummary =
    filters.stages.length === 0
      ? "Any"
      : filters.stages.length === 1
        ? STAGE_LABEL[filters.stages[0]]
        : `${filters.stages.length} selected`;

  const sectorSummary =
    filters.sectors.length === 0
      ? "Any"
      : filters.sectors.length === 1
        ? SECTOR_LABEL[filters.sectors[0]]
        : `${filters.sectors.length} selected`;

  const eventSummary =
    filters.daysWindow == null ? "Any time" : `≤ ${filters.daysWindow} days`;

  const probSummary =
    filters.probMin === 0 ? "Any" : `≥ ${filters.probMin}%`;

  const sortSummary =
    SORT_OPTIONS.find((o) => o.value === filters.sort)?.label ?? "Sort";

  return (
    <div className="border-b border-gray-200 bg-paper-soft/60">
      <div className="mx-auto max-w-7xl px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Stage */}
          <FilterPopover
            label="Stage"
            summary={stageSummary}
            active={filters.stages.length > 0}
          >
            {() => (
              <CheckboxList
                options={STAGES.map((s) => ({ value: s, label: STAGE_LABEL[s] }))}
                selected={filters.stages}
                onToggle={(v) =>
                  update({ stages: toggle(filters.stages, v as DealStatus) })
                }
                onClear={
                  filters.stages.length > 0
                    ? () => update({ stages: [] })
                    : undefined
                }
              />
            )}
          </FilterPopover>

          {/* Sector */}
          <FilterPopover
            label="Sector"
            summary={sectorSummary}
            active={filters.sectors.length > 0}
          >
            {() => (
              <CheckboxList
                options={SECTORS.map((s) => ({
                  value: s,
                  label: SECTOR_LABEL[s] ?? s,
                }))}
                selected={filters.sectors}
                onToggle={(v) =>
                  update({ sectors: toggle(filters.sectors, v as Sector) })
                }
                onClear={
                  filters.sectors.length > 0
                    ? () => update({ sectors: [] })
                    : undefined
                }
              />
            )}
          </FilterPopover>

          {/* Event window */}
          <FilterPopover
            label="Event in"
            summary={eventSummary}
            active={filters.daysWindow != null}
          >
            {(close) => (
              <RadioList
                options={[
                  { value: "any", label: "Any time" },
                  ...EVENT_WINDOWS.map((d) => ({
                    value: String(d),
                    label: `Within ${d} days`,
                  })),
                ]}
                selected={
                  filters.daysWindow == null ? "any" : String(filters.daysWindow)
                }
                onChange={(v) => {
                  update({ daysWindow: v === "any" ? null : Number(v) });
                  close();
                }}
              />
            )}
          </FilterPopover>

          {/* Min probability */}
          <FilterPopover
            label="Min prob."
            summary={probSummary}
            active={filters.probMin > 0}
          >
            {() => (
              <ProbPanel
                value={filters.probMin}
                onChange={(v) => update({ probMin: v })}
              />
            )}
          </FilterPopover>

          {/* Sort */}
          <div className="ml-auto flex items-center gap-2">
            <FilterPopover
              label="Sort"
              summary={sortSummary}
              active={filters.sort !== "next_event"}
              align="right"
            >
              {(close) => (
                <RadioList
                  options={SORT_OPTIONS}
                  selected={filters.sort}
                  onChange={(v) => {
                    update({ sort: v as SortKey });
                    close();
                  }}
                />
              )}
            </FilterPopover>
            {hasActive && (
              <button
                onClick={reset}
                className="h-8 rounded-full border border-gray-300 bg-white px-3 text-[12px] font-medium text-gray-600 transition hover:border-brand-navy hover:text-brand-navy"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reusable panels ─────────────────────────────────────────────────────────

function CheckboxList({
  options,
  selected,
  onToggle,
  onClear,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (v: string) => void;
  onClear?: () => void;
}) {
  return (
    <div>
      <ul className="max-h-72 overflow-auto py-1.5">
        {options.map((o) => {
          const isOn = selected.includes(o.value);
          return (
            <li key={o.value}>
              <button
                onClick={() => onToggle(o.value)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50"
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    isOn
                      ? "border-brand-navy bg-brand-navy text-white"
                      : "border-gray-300 bg-white"
                  }`}
                  aria-hidden
                >
                  {isOn && (
                    <svg width="10" height="10" viewBox="0 0 10 10">
                      <path
                        d="M2 5l2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                {o.label}
              </button>
            </li>
          );
        })}
      </ul>
      {onClear && (
        <div className="border-t border-gray-100 p-1.5">
          <button
            onClick={onClear}
            className="w-full rounded px-2 py-1.5 text-left text-[12px] text-gray-600 hover:bg-gray-50 hover:text-brand-navy"
          >
            Clear selection
          </button>
        </div>
      )}
    </div>
  );
}

function RadioList({
  options,
  selected,
  onChange,
}: {
  options: { value: string; label: string }[];
  selected: string;
  onChange: (v: string) => void;
}) {
  return (
    <ul className="py-1.5">
      {options.map((o) => {
        const isOn = selected === o.value;
        return (
          <li key={o.value}>
            <button
              onClick={() => onChange(o.value)}
              className={`flex w-full items-center justify-between gap-2.5 px-3 py-2 text-[13px] hover:bg-gray-50 ${
                isOn ? "text-brand-navy" : "text-gray-700"
              }`}
            >
              <span>{o.label}</span>
              {isOn && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  className="text-brand-gold"
                >
                  <path
                    d="M2 6l3 3 5-6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ProbPanel({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[10px] font-medium uppercase tracking-label text-gray-500">
          Minimum closing probability
        </span>
        <span className="text-[14px] font-semibold tabular-nums text-brand-navy">
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-brand-navy"
      />
      <div className="mt-1 flex justify-between text-[10px] text-gray-400 tabular-nums">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
      {value > 0 && (
        <button
          onClick={() => onChange(0)}
          className="mt-3 w-full rounded border border-gray-200 px-2 py-1 text-[12px] text-gray-600 hover:border-brand-navy hover:text-brand-navy"
        >
          Reset
        </button>
      )}
    </div>
  );
}
