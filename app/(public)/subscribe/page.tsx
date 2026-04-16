import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SubscribeButton } from "./SubscribeButton";

const PLANS = [
  {
    name: "Starter",
    price: "$29",
    per: "one-time download",
    tagline: "Pick a single situation to go deep on.",
    features: [
      "One report covering up to 4 deals",
      "PDF download",
      "One-time access — keep forever",
    ],
    primary: false,
  },
  {
    name: "Situations Monthly",
    price: "$49",
    per: "per month",
    tagline: "Best for active investors tracking a portfolio of situations.",
    features: [
      "10 deals, editor's choice",
      "Web reader + PDF exports",
      "Twice-monthly deal updates",
      "Email alerts on deal movement",
      "Cancel anytime via Stripe",
    ],
    primary: true,
  },
];

const FAQ = [
  {
    q: "What's included in a paid subscription?",
    a: "Full access to every active situation — CTFN analysis, regulatory filings with lifecycle tracking, risk factors, deal documents, shareholder vote status, and watchlist alerts when a situation moves.",
  },
  {
    q: "How do watchlist alerts work?",
    a: "Follow any deal from its page. When our editorial team publishes a material update, you'll receive an email within 15 minutes linking directly to what changed.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Manage your subscription from the Stripe Customer Portal in your account page. Cancellation takes effect at the end of the current billing period — no prorated refunds, but you keep access through the paid period.",
  },
  {
    q: "What happens if my card fails?",
    a: "We enter a 3-day grace period — your access stays active while Stripe retries. If retries fail we flag the account but don't revoke access immediately.",
  },
  {
    q: "Do you offer team or enterprise pricing?",
    a: "Not in V1 — all seats are single-user. Contact us if you'd like to discuss firm-wide access.",
  },
];

export default function SubscribePage() {
  const { userId } = auth();
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="border-b border-gray-200 pb-8 text-center">
        <div className="text-[11px] font-medium uppercase tracking-label text-brand-gold-ink">
          Pricing
        </div>
        <h1 className="mt-2 font-serif text-[34px] leading-[1.2] tracking-tight text-brand-navy">
          Built for merger-arb professionals
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-[1.6] text-gray-600">
          Structured intelligence on every active M&amp;A situation. Regulatory
          lifecycle tracking, CTFN editorial analysis, and watchlist alerts
          when situations move.
        </p>
      </header>

      <section className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {PLANS.map((p) => (
          <div
            key={p.name}
            className={`flex flex-col rounded-lg border bg-white p-6 ${
              p.primary
                ? "border-[1.5px] border-brand-gold shadow-sm"
                : "border-gray-200"
            }`}
          >
            {p.primary && (
              <div className="mb-3 inline-flex w-fit rounded border border-brand-gold/40 bg-brand-gold-light px-2 py-[2px] text-[10px] font-medium uppercase tracking-label text-brand-gold-ink">
                Recommended
              </div>
            )}
            <div className="text-[11px] font-medium uppercase tracking-label text-gray-500">
              {p.name}
            </div>
            <div className="mt-2 flex items-baseline gap-2 tabular-nums">
              <span className="text-[32px] font-semibold text-brand-navy">
                {p.price}
              </span>
              <span className="text-[12px] text-gray-500">{p.per}</span>
            </div>
            <p className="mt-1 text-[13px] text-gray-600">{p.tagline}</p>
            <ul className="mt-5 space-y-2">
              {p.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-[13px] leading-[1.5] text-gray-700"
                >
                  <span className="mt-[7px] block h-1 w-1 shrink-0 rounded-full bg-brand-gold" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-4">
              {p.primary ? (
                userId ? (
                  <SubscribeButton />
                ) : (
                  <div className="flex gap-2">
                    <Link
                      href="/sign-up"
                      className="flex-1 rounded bg-brand-navy px-4 py-2.5 text-center text-[13px] font-medium text-white hover:bg-brand-navy-dark"
                    >
                      Create account
                    </Link>
                    <Link
                      href="/sign-in"
                      className="rounded border border-gray-300 px-4 py-2.5 text-[13px] font-medium hover:border-brand-navy"
                    >
                      Sign in
                    </Link>
                  </div>
                )
              ) : (
                <button
                  disabled
                  className="w-full cursor-not-allowed rounded border border-gray-300 px-4 py-2.5 text-[13px] font-medium text-gray-500"
                >
                  One-time — coming soon
                </button>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-14">
        <h2 className="text-[11px] font-medium uppercase tracking-label text-gray-500">
          Frequently asked
        </h2>
        <dl className="mt-4 divide-y divide-gray-200 border-t border-gray-200">
          {FAQ.map((item) => (
            <div key={item.q} className="py-5">
              <dt className="text-[15px] font-semibold text-brand-navy">
                {item.q}
              </dt>
              <dd className="mt-1.5 text-[14px] leading-[1.6] text-gray-600">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="py-12 text-center">
        <p className="text-[13px] text-gray-500">
          Questions?{" "}
          <a
            href="mailto:hello@ctfnlighthouse.com"
            className="text-brand-navy underline decoration-brand-gold underline-offset-2"
          >
            hello@ctfnlighthouse.com
          </a>
        </p>
      </div>
    </main>
  );
}
