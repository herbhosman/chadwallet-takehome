"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface WatchlistButtonProps {
  mint: string;
}

export function WatchlistButton({ mint }: WatchlistButtonProps) {
  const { authenticated, user } = usePrivy();
  const [watching, setWatching] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const res = await fetch(
      `/api/watchlist?userId=${encodeURIComponent(user.id)}`,
    );
    if (!res.ok) return;
    const data = await res.json();
    setWatching((data.mints ?? []).includes(mint));
  }, [user?.id, mint]);

  useEffect(() => {
    if (authenticated && user?.id) load();
  }, [authenticated, user?.id, load]);

  const toggle = async () => {
    if (!user?.id || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, mint }),
      });
      const data = await res.json();
      if (res.ok) setWatching(Boolean(data.watching));
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      title={watching ? "Remove from watchlist" : "Add to watchlist"}
      className="rounded-lg border border-chad-border bg-chad-bg p-2 text-chad-muted transition-colors hover:border-chad-accent/40 hover:text-chad-accent disabled:opacity-50"
    >
      <Star
        className={cn(
          "h-4 w-4",
          watching && "fill-chad-accent text-chad-accent",
        )}
      />
    </button>
  );
}
