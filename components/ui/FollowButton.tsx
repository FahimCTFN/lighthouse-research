"use client";

import { useState, useTransition } from "react";

export function FollowButton({
  slug,
  initialFollowing,
}: {
  slug: string;
  initialFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !following;
    setFollowing(next);
    startTransition(async () => {
      const res = await fetch(
        next ? "/api/watchlist/follow" : "/api/watchlist/unfollow",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        },
      );
      if (!res.ok) setFollowing(!next); // revert
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`rounded border px-3 py-1.5 text-sm font-medium transition ${
        following
          ? "border-brand-navy bg-brand-navy text-white"
          : "border-gray-300 bg-white text-brand-navy hover:border-brand-navy"
      }`}
    >
      {following ? "★ Following" : "☆ Follow this deal"}
    </button>
  );
}
