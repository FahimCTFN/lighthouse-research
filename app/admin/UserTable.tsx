"use client";

import { useCallback, useEffect, useState } from "react";

interface Row {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastSignInAt: string | null;
  role: "admin" | "editor" | "viewer" | null;
  status: string;
  isPaid: boolean;
  manualGrant: boolean;
  manualExpiry: string | null;
  stripeCustomerId: string | null;
  watchlistCount: number;
}

type Filter = "all" | "paid" | "free" | "admin" | "editor" | "manual";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "paid", label: "Paid" },
  { key: "free", label: "Free" },
  { key: "admin", label: "Admins" },
  { key: "editor", label: "Editors" },
  { key: "manual", label: "Manual grants" },
];

export function UserTable() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (filter !== "all") params.set("filter", filter);
    const res = await fetch(`/api/admin/users?${params.toString()}`);
    const data = await res.json();
    setRows(data.users || []);
    setTotal(data.totalCount || 0);
    setLoading(false);
  }, [q, filter]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  async function act(path: string, body: object, note: string) {
    setMsg(null);
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setMsg(note);
      load();
      setTimeout(() => setMsg(null), 2000);
    } else {
      const data = await res.json().catch(() => ({}));
      setMsg(`Failed: ${data.error ?? res.status}`);
    }
  }

  function grant(userId: string, withExpiry = false) {
    let expiry: string | undefined;
    if (withExpiry) {
      const input = window.prompt(
        "Expiry date (YYYY-MM-DD)? Leave blank for no expiry.",
      );
      expiry = input?.trim() || undefined;
    }
    act("/api/admin/grant", { userId, expiry }, "Paid access granted.");
  }

  function revoke(userId: string, email: string) {
    if (!window.confirm(`Revoke paid access for ${email}?`)) return;
    act("/api/admin/revoke", { userId }, "Paid access revoked.");
  }

  function setRole(userId: string, role: string) {
    const next = role === "" ? null : role;
    act("/api/admin/role", { userId, role: next }, `Role set to ${role || "none"}.`);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm sm:w-72"
        />
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-2.5 py-1 text-[11px] ${
                filter === f.key
                  ? "border-brand-navy bg-brand-navy text-white"
                  : "border-gray-300 bg-white text-gray-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="ml-auto text-[11px] text-gray-500">
          {loading ? "Loading…" : `${rows.length} shown · ${total} total`}
        </div>
      </div>

      {msg && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-[12px] text-amber-900">
          {msg}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-[10px] uppercase tracking-label text-gray-500">
            <tr>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Tier</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Joined</th>
              <th className="px-4 py-2">Watchlist</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!rows.length && !loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No users match.
                </td>
              </tr>
            )}
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-gray-100 align-top">
                <td className="px-4 py-3">
                  <div className="font-medium">{u.name || "—"}</div>
                  <div className="text-[11px] text-gray-500">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  <TierBadge row={u} />
                  {u.manualExpiry && (
                    <div className="mt-0.5 text-[10px] text-gray-500">
                      until {new Date(u.manualExpiry).toLocaleDateString()}
                    </div>
                  )}
                  {u.stripeCustomerId && (
                    <div className="mt-0.5 text-[10px] text-gray-500">
                      Stripe: {u.stripeCustomerId.slice(0, 14)}…
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.role ?? ""}
                    onChange={(e) => setRole(u.id, e.target.value)}
                    className="rounded border border-gray-300 bg-white px-2 py-1 text-xs"
                  >
                    <option value="">—</option>
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-[11px] text-gray-600 tabular-nums">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-[11px] text-gray-600 tabular-nums">
                  {u.watchlistCount}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {u.isPaid ? (
                      <button
                        onClick={() => revoke(u.id, u.email)}
                        className="rounded border border-red-300 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-50"
                      >
                        Revoke
                      </button>
                    ) : (
                      <button
                        onClick={() => grant(u.id)}
                        className="rounded bg-brand-gold px-2.5 py-1 text-[11px] font-medium text-white hover:brightness-95"
                      >
                        Make premium
                      </button>
                    )}
                    <button
                      onClick={() => grant(u.id, true)}
                      className="rounded border border-gray-300 px-2 py-1 text-[11px] font-medium hover:border-brand-navy"
                    >
                      + expiry
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TierBadge({ row }: { row: Row }) {
  if (row.isPaid) {
    const label = row.manualGrant
      ? "Premium (comp)"
      : row.status === "past_due"
        ? "Premium (past-due)"
        : "Premium";
    return (
      <span className="inline-flex rounded border border-brand-gold/40 bg-brand-gold-light px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-label text-brand-gold-ink">
        {label}
      </span>
    );
  }
  if (row.status === "cancelled") {
    return (
      <span className="inline-flex rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-label text-gray-600">
        Cancelled
      </span>
    );
  }
  return (
    <span className="inline-flex rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-label text-gray-500">
      Free
    </span>
  );
}
