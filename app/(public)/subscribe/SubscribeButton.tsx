"use client";

import { useState } from "react";

export function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  async function go() {
    setLoading(true);
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        returnUrl: typeof window !== "undefined" ? window.location.href : "",
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
      className="rounded bg-brand-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
    >
      {loading ? "Redirecting…" : "Subscribe with Stripe"}
    </button>
  );
}
