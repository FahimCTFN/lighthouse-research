"use client";

import { useState } from "react";

export function BuyReportButton({
  slug,
  price,
}: {
  slug: string;
  price: number;
}) {
  const [loading, setLoading] = useState(false);
  async function go() {
    setLoading(true);
    const res = await fetch("/api/stripe/buy-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        returnUrl: typeof window !== "undefined" ? window.location.href.split("?")[0] : "",
      }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(false);
  }
  return (
    <button
      onClick={go}
      disabled={loading}
      className="w-full rounded border border-brand-navy bg-white px-4 py-2.5 text-[13px] font-medium text-brand-navy transition hover:bg-brand-navy hover:text-white disabled:opacity-50"
    >
      {loading ? "Redirecting…" : `Buy this report — $${price}`}
    </button>
  );
}
