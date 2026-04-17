import { clerkClient } from "@clerk/nextjs/server";
import Link from "next/link";
import { sanityClient } from "@/lib/sanity/client";
import {
  ALL_ACTIVE_DEAL_COUNT,
  STALE_DEALS_QUERY,
} from "@/lib/sanity/queries";
import type { UserMetadata } from "@/lib/clerk/helpers";
import { isPaidStatus } from "@/lib/clerk/helpers";
import { UserTable } from "./UserTable";
import { RevenuePanel } from "./RevenuePanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Aggregate stats — iterates a single page of users (V1-acceptable; replace
  // with a dedicated index when user volume grows).
  const { data: usersPage, totalCount } = await clerkClient.users.getUserList({
    limit: 200,
    orderBy: "-created_at",
  });

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  let activePaid = 0;
  let manualGrants = 0;
  let signups7 = 0;
  let signups30 = 0;
  for (const u of usersPage) {
    const meta = (u.publicMetadata ?? {}) as UserMetadata;
    if (isPaidStatus(meta)) activePaid++;
    if (meta.manualAccessGrant) manualGrants++;
    const created = new Date(u.createdAt).getTime();
    if (now - created < 7 * day) signups7++;
    if (now - created < 30 * day) signups30++;
  }

  const cutoff = new Date(now - 7 * day).toISOString();
  const [activeDealCount, staleDeals] = await Promise.all([
    sanityClient.fetch<number>(ALL_ACTIVE_DEAL_COUNT),
    sanityClient.fetch<
      {
        _id: string;
        acquirer: string;
        target: string;
        slug: string;
        _updatedAt: string;
      }[]
    >(STALE_DEALS_QUERY, { cutoff }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="font-serif text-2xl tracking-tight">Admin</h1>
          <p className="mt-1 text-sm text-gray-500">
            User tiers, roles, subscriber stats, and deal health.
          </p>
        </div>
        <Link
          href="/studio"
          className="rounded border border-gray-300 px-3 py-1.5 text-xs hover:border-brand-navy"
        >
          Open Studio →
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="Total users" value={totalCount} />
        <Stat label="Premium" value={activePaid} accent />
        <Stat label="Manual grants" value={manualGrants} />
        <Stat label="New (7d)" value={signups7} />
        <Stat label="New (30d)" value={signups30} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-label text-gray-500">
          Revenue
        </h2>
        <RevenuePanel />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-label text-gray-500">
          Users
        </h2>
        <UserTable />
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-[11px] font-medium uppercase tracking-label text-gray-500">
            Deal health
          </h2>
          <p className="mt-2 text-sm">
            Active deals:{" "}
            <span className="font-semibold tabular-nums">
              {activeDealCount}
            </span>
          </p>
          <p className="mt-1 text-sm">
            Not updated in 7+ days:{" "}
            <span className="font-semibold tabular-nums">
              {staleDeals.length}
            </span>
          </p>
          {staleDeals.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-gray-600">
              {staleDeals.slice(0, 10).map((d) => (
                <li key={d._id}>
                  <Link
                    href={`/deals/${d.slug}`}
                    className="hover:underline"
                  >
                    {d.target} / {d.acquirer}
                  </Link>{" "}
                  <span className="text-gray-400">
                    (updated {new Date(d._updatedAt).toLocaleDateString()})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-[11px] font-medium uppercase tracking-label text-gray-500">
            Recent sign-ups
          </h2>
          <ul className="mt-3 divide-y divide-gray-100 text-sm">
            {usersPage.slice(0, 10).map((u) => (
              <li key={u.id} className="flex justify-between py-2">
                <span>
                  {u.firstName ?? ""} {u.lastName ?? ""}{" "}
                  <span className="text-gray-500">
                    {u.primaryEmailAddress?.emailAddress}
                  </span>
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        accent
          ? "border-brand-gold/40 bg-brand-gold-light"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="text-[10px] uppercase tracking-label text-gray-500">
        {label}
      </div>
      <div
        className={`mt-1 text-2xl font-semibold tabular-nums ${
          accent ? "text-brand-gold-ink" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
