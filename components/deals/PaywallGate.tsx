import Link from "next/link";

export function PaywallGate() {
  return (
    <section className="rounded-lg border border-gray-200 bg-white px-7 py-8 text-center">
      <div className="mb-2 text-[10px] font-medium uppercase tracking-label text-gray-500">
        Members only
      </div>
      <h3 className="font-serif text-[20px] font-normal text-brand-navy">
        Full intelligence on this situation
      </h3>
      <p className="mx-auto mt-2 max-w-[380px] text-[13px] leading-[1.6] text-gray-600">
        Subscribe to unlock the complete regulatory timeline, EC and CMA
        analysis, advisor details, key documents, and CTFN&apos;s proprietary
        closing estimate methodology.
      </p>

      <div className="mx-auto mt-5 grid max-w-[440px] grid-cols-1 gap-3 text-left sm:grid-cols-2">
        <PlanCard
          name="Starter"
          price="$29"
          per="one-time download"
          features={[
            "This report, 4 deals",
            "PDF download",
            "One-time access",
          ]}
        />
        <PlanCard
          featured
          name="Situations monthly"
          price="$49"
          per="per month"
          features={[
            "10 deals, editor's choice",
            "Web reader + PDF",
            "Twice-monthly updates",
            "Deal movement alerts",
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2.5">
        <Link
          href="/subscribe"
          className="rounded bg-brand-navy px-7 py-2.5 text-[12px] font-medium tracking-wide text-white hover:bg-brand-navy-dark"
        >
          Subscribe — $49/mo
        </Link>
        <Link
          href="/subscribe"
          className="rounded border border-gray-300 px-4 py-2.5 text-[12px] font-medium text-gray-600 hover:border-brand-navy"
        >
          Get one-time report
        </Link>
      </div>
    </section>
  );
}

function PlanCard({
  featured = false,
  name,
  price,
  per,
  features,
}: {
  featured?: boolean;
  name: string;
  price: string;
  per: string;
  features: string[];
}) {
  return (
    <div
      className={`rounded border p-4 ${
        featured ? "border-[1.5px] border-brand-gold" : "border-gray-200"
      }`}
    >
      <div
        className={`text-[11px] font-medium uppercase tracking-label ${
          featured ? "text-brand-gold-ink" : "text-gray-500"
        }`}
      >
        {name}
      </div>
      <div className="mt-1 text-[22px] font-semibold tabular-nums text-brand-navy">
        {price}
      </div>
      <div className="text-[11px] text-gray-500">{per}</div>
      <ul className="mt-3 space-y-1.5">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-1.5 text-[12px] leading-[1.5] text-gray-600"
          >
            <span className="mt-[5px] block h-1 w-1 shrink-0 rounded-full bg-brand-gold" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
