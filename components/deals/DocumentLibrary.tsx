import type { DealDocument } from "@/lib/sanity/types";

export function DocumentLibrary({ docs }: { docs?: DealDocument[] }) {
  if (!docs?.length) return null;
  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <header className="border-b border-gray-100 px-5 py-3">
        <h2 className="text-[11px] font-medium uppercase tracking-label text-gray-500">
          Key Deal Documents
        </h2>
      </header>
      <ul className="divide-y divide-gray-100">
        {docs.map((d, i) => (
          <li
            key={d._key ?? i}
            className="flex items-center justify-between gap-4 px-5 py-3"
          >
            <span className="text-[14px] font-medium text-brand-navy">
              {d.title || "Untitled"}
            </span>
            {d.url && (
              <a
                href={d.url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded border border-gray-300 px-3 py-1.5 text-[11px] font-medium hover:border-brand-navy"
              >
                Open
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
