import { STAGE_COLORS, STAGE_LABEL, formatSector } from "@/lib/format";
import type { DealStatus } from "@/lib/sanity/types";

export function StageBadge({ status }: { status: DealStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-[2px] text-[10px] font-medium uppercase tracking-label ${STAGE_COLORS[status]}`}
    >
      {STAGE_LABEL[status]}
    </span>
  );
}

export function SectorTag({ sector }: { sector: string }) {
  return (
    <span className="inline-flex items-center rounded border border-blue-200 bg-blue-50 px-2 py-[2px] text-[10px] font-medium uppercase tracking-label text-brand-navy">
      {formatSector(sector)}
    </span>
  );
}

export function ActiveSituationTag() {
  return (
    <span className="inline-flex items-center rounded border border-brand-gold/40 bg-brand-gold-light px-2 py-[2px] text-[10px] font-medium uppercase tracking-label text-brand-gold-ink">
      Active situation
    </span>
  );
}
