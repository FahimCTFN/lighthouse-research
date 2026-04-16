import { formatDate } from "@/lib/format";
import type { ActivismEntry, ActivismStance } from "@/lib/sanity/types";

const STANCE_LABEL: Record<ActivismStance, string> = {
  supportive: "Supportive",
  opposed: "Opposed",
  critical: "Critical",
  neutral: "Neutral",
};

const STANCE_BADGE: Record<ActivismStance, string> = {
  supportive: "bg-green-50 text-green-800 border border-green-200",
  opposed: "bg-red-50 text-red-800 border border-red-200",
  critical: "bg-brand-gold-light text-brand-gold-ink border border-brand-gold/40",
  neutral: "bg-gray-100 text-gray-700 border border-gray-300",
};

const STANCE_DOT: Record<ActivismStance, string> = {
  supportive: "bg-green-500",
  opposed: "bg-red-500",
  critical: "bg-brand-gold",
  neutral: "bg-gray-400",
};

export function ShareholderActivism({ entries }: { entries?: ActivismEntry[] }) {
  const valid = (entries ?? []).filter(
    (e) => e.actor && e.description && e.date,
  );
  if (!valid.length) return null;

  // Newest first
  const sorted = [...valid].sort(
    (a, b) => (a.date! < b.date! ? 1 : a.date! > b.date! ? -1 : 0),
  );

  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <header className="border-b border-gray-100 px-5 py-3">
        <h2 className="text-[11px] font-medium uppercase tracking-label text-gray-500">
          Shareholder Activism
        </h2>
      </header>
      <ul className="divide-y divide-gray-100">
        {sorted.map((e, i) => {
          const stance: ActivismStance = e.stance ?? "critical";
          return (
            <li key={e._key ?? i} className="px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  aria-hidden
                  className={`block h-1.5 w-1.5 rounded-full ${STANCE_DOT[stance]}`}
                />
                <span className="text-[14px] font-semibold text-brand-navy">
                  {e.actor}
                </span>
                <span
                  className={`inline-flex rounded px-1.5 py-[1px] text-[10px] font-medium uppercase tracking-label ${STANCE_BADGE[stance]}`}
                >
                  {STANCE_LABEL[stance]}
                </span>
                <span className="text-[11px] tabular-nums text-gray-500 sm:ml-auto">
                  {formatDate(e.date)}
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-[1.6] text-ink">
                {e.description}
              </p>
              {e.source_url && (
                <a
                  href={e.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-[11px] font-medium uppercase tracking-label text-brand-navy underline decoration-brand-gold underline-offset-2"
                >
                  Source ↗
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
