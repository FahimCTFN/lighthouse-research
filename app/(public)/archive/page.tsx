import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import { ARCHIVED_DEALS_QUERY } from "@/lib/sanity/queries";
import type { DealListItem } from "@/lib/sanity/types";
import { DealCard } from "@/components/deals/DealCard";
import { getCurrentUserContext } from "@/lib/clerk/helpers";

export const revalidate = 60;

export default async function ArchivePage() {
  const [{ isPaid }, deals] = await Promise.all([
    getCurrentUserContext(),
    sanityClient.fetch<DealListItem[]>(ARCHIVED_DEALS_QUERY),
  ]);

  const closed = deals.filter((d) => d.status === "closed");
  const terminated = deals.filter((d) => d.status === "terminated");

  return (
    <main className="mx-auto max-w-7xl px-6 pt-10">
      <header className="border-b border-gray-200 pb-6">
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-label text-gray-500 hover:text-brand-navy"
        >
          <span aria-hidden>←</span> All active situations
        </Link>
        <h1 className="font-serif text-[28px] leading-[1.25] tracking-tight text-brand-navy">
          Archive
        </h1>
        <p className="mt-2 text-[15px] leading-[1.6] text-gray-600">
          Closed, terminated, and archived situations. Closed and terminated
          deals remain here for two weeks before archival; archived deals are
          kept for reference and are accessible by direct URL.
        </p>
      </header>

      <Section
        title="Recently closed"
        count={closed.length}
        deals={closed}
        isPaid={isPaid}
        emptyHint="No deals have closed recently."
      />
      <Section
        title="Terminated"
        count={terminated.length}
        deals={terminated}
        isPaid={isPaid}
        emptyHint="No deals have been terminated."
      />
    </main>
  );
}

function Section({
  title,
  count,
  deals,
  isPaid,
  emptyHint,
}: {
  title: string;
  count: number;
  deals: DealListItem[];
  isPaid: boolean;
  emptyHint: string;
}) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-[11px] font-medium uppercase tracking-label text-gray-500">
          {title}
        </h2>
        <span className="text-[11px] tabular-nums text-gray-500">
          {count} {count === 1 ? "deal" : "deals"}
        </span>
      </div>
      {deals.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white/60 px-5 py-8 text-center text-[13px] text-gray-500">
          {emptyHint}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((d) => (
            <DealCard key={d._id} deal={d} locked={!isPaid} />
          ))}
        </div>
      )}
    </section>
  );
}

