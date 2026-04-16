import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { SubscribeButton } from "./SubscribeButton";
import { CheckoutSuccess } from "@/components/deals/CheckoutSuccess";

const PLAN = {
  name: "Professional",
  price: "$499",
  per: "per month",
  tagline:
    "Full access to every active situation — CTFN analysis, regulatory lifecycle, documents, and watchlist alerts.",
  features: [
    "Full gated content on all active deals",
    "CTFN analysis, regulatory filings, risk factors",
    "Per-regulator lifecycle tracking with step-by-step status",
    "Shareholder activism + voting agreement tracking",
    "Key Facts, deal documents, advisors",
    "Watchlist — follow deals and receive email alerts",
    "Cancel anytime via Stripe Customer Portal",
  ],
};

const FAQ = [
  {
    q: "What's included in the subscription?",
    a: "Full access to every active situation — CTFN editorial analysis, per-regulator filing lifecycle with step tracking, shareholder activism, deal documents, key facts, advisors, and watchlist alerts when situations move.",
  },
  {
    q: "How do watchlist alerts work?",
    a: "Follow any deal from its page. When the editorial team publishes a material update, you receive an email within 15 minutes with a summary and direct link to what changed.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Manage your subscription through the Stripe Customer Portal in your account. Cancellation takes effect at the end of the current billing period — you keep access through the paid period.",
  },
  {
    q: "What happens if my card fails?",
    a: "We enter a 3-day grace period — your access stays active while Stripe retries. If retries fail we flag the account but don't revoke access immediately.",
  },
  {
    q: "Do you offer annual pricing or team seats?",
    a: "Not yet. Annual pricing and firm-wide access are planned. Contact us to discuss enterprise needs.",
  },
];

export default function SubscribePage() {
  const { userId } = auth();
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <CheckoutSuccess />
      <header className="border-b border-gray-200 pb-8 text-center">
        <div className="text-[11px] font-medium uppercase tracking-label text-brand-gold-ink">
          Pricing
        </div>
        <h1 className="mt-2 font-serif text-[26px] leading-[1.2] tracking-tight text-brand-navy sm:text-[34px]">
          M&amp;A intelligence built for professionals
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-[1.6] text-gray-600">
          Structured deal intelligence, regulatory lifecycle tracking, CTFN
          editorial analysis, and watchlist alerts.
        </p>
      </header>

      <section className="mt-10 rounded-lg border-[1.5px] border-brand-gold bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="text-[11px] font-medium uppercase tracking-label text-gray-500">
            {PLAN.name}
          </div>
          <div className="mt-3 flex items-baseline justify-center gap-2 tabular-nums">
            <span className="text-[42px] font-semibold text-brand-navy">
              {PLAN.price}
            </span>
            <span className="text-[14px] text-gray-500">{PLAN.per}</span>
          </div>
          <p className="mx-auto mt-2 max-w-md text-[14px] leading-[1.55] text-gray-600">
            {PLAN.tagline}
          </p>
        </div>

        <ul className="mx-auto mt-8 max-w-sm space-y-3">
          {PLAN.features.map((f) => (
            <li
              key={f}
              className="flex items-start gap-2.5 text-[14px] leading-[1.5] text-gray-700"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                className="mt-0.5 shrink-0 text-green-600"
              >
                <path
                  d="M3 8l3 3 7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {f}
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-8 max-w-sm">
          {userId ? (
            <SubscribeButton label="Subscribe — $499/mo" />
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/sign-up"
                className="w-full rounded bg-brand-navy px-4 py-3 text-center text-[14px] font-medium text-white hover:bg-brand-navy-dark"
              >
                Create account to subscribe
              </Link>
              <p className="text-center text-[12px] text-gray-500">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-brand-navy underline decoration-brand-gold underline-offset-2"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
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
