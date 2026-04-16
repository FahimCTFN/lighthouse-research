import Link from "next/link";

export function SubscriptionBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 text-sm">
        <span className="text-amber-900">
          Sign up free for snapshot access — subscribe for full deal
          intelligence, regulatory timelines, and watchlist alerts.
        </span>
        <div className="flex gap-3">
          <Link href="/sign-up" className="font-medium hover:underline">
            Sign up free
          </Link>
          <Link
            href="/subscribe"
            className="rounded bg-brand-navy px-3 py-1 font-medium text-white"
          >
            Subscribe
          </Link>
        </div>
      </div>
    </div>
  );
}
