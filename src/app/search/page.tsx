"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { AppShell } from "@/components/layout/AppShell";
import { TokenAvatar } from "@/components/ui/TokenAvatar";
import { formatPct, formatUsd, cn } from "@/lib/utils";
import type { TokenInfo } from "@/types/token";
import { MOCK_TRENDING } from "@/lib/mock-data";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const { data: trending = MOCK_TRENDING } = useSWR<TokenInfo[]>(
    "/api/trending",
    fetcher,
    { fallbackData: MOCK_TRENDING },
  );

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const { data: searchResults } = useSWR<TokenInfo[]>(
    debounced.length >= 2
      ? `/api/search?q=${encodeURIComponent(debounced)}`
      : null,
    fetcher,
  );

  const filtered =
    debounced.length >= 2
      ? (searchResults ?? [])
      : trending.filter(
          (t) =>
            t.symbol.toLowerCase().includes(q.toLowerCase()) ||
            t.name.toLowerCase().includes(q.toLowerCase()) ||
            t.address.toLowerCase().includes(q.toLowerCase()),
        );

  return (
    <AppShell tokens={trending}>
      <div className="mx-auto max-w-lg space-y-4 px-4 py-6">
        <h1 className="text-xl font-black">Search</h1>
        <p className="text-xs text-chad-muted">
          Codex search · paste a mint address or type a name
        </p>
        <input
          type="search"
          placeholder="Token name, symbol, or address…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-2xl border border-chad-border bg-chad-surface px-4 py-3 text-sm outline-none focus:border-chad-accent"
        />
        <ul className="space-y-2">
          {filtered.length === 0 ? (
            <li className="rounded-xl border border-chad-border bg-chad-surface px-4 py-8 text-center text-sm text-chad-muted">
              No tokens match &ldquo;{q}&rdquo;
            </li>
          ) : (
            filtered.map((token) => (
              <li key={token.address}>
                <Link
                  href={`/trade/${token.address}`}
                  className="flex items-center gap-3 rounded-xl border border-chad-border bg-chad-surface px-4 py-3 hover:border-chad-accent/30"
                >
                  <TokenAvatar
                    symbol={token.symbol}
                    imageUrl={token.imageUrl}
                    size={36}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold">{token.symbol}</div>
                    <div className="text-xs text-chad-muted">{token.name}</div>
                  </div>
                  <div className="text-right text-sm shrink-0">
                    <div>{formatUsd(token.priceUsd)}</div>
                    <div
                      className={cn(
                        "text-xs font-bold",
                        token.change24h >= 0
                          ? "text-chad-accent"
                          : "text-chad-danger",
                      )}
                    >
                      {formatPct(token.change24h)}
                    </div>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </AppShell>
  );
}
