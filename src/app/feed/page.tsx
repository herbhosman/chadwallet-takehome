"use client";

import useSWR from "swr";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { formatUsd, shortenAddress } from "@/lib/utils";
import type { FeedTrade, TokenInfo } from "@/types/token";
import { MOCK_TRENDING } from "@/lib/mock-data";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function FeedPage() {
  const { data: tokens = MOCK_TRENDING } = useSWR<TokenInfo[]>(
    "/api/trending",
    fetcher,
    { fallbackData: MOCK_TRENDING },
  );

  const { data: trades = [], isLoading } = useSWR<FeedTrade[]>(
    "/api/feed",
    fetcher,
    { refreshInterval: 15_000 },
  );

  return (
    <AppShell tokens={tokens}>
      <div className="mx-auto max-w-lg space-y-4 px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black">Social Feed</h1>
            <p className="text-sm text-chad-muted">
              Live swaps across trending Solana tokens
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] text-chad-accent">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-chad-accent" />
            LIVE
          </span>
        </div>

        {isLoading && trades.length === 0 ? (
          <p className="text-sm text-chad-muted">Loading live trades…</p>
        ) : null}

        <ul className="space-y-3">
          {trades.map((trade, i) => (
            <li
              key={`${trade.id}-${trade.timestamp}-${i}`}
              className="rounded-xl border border-chad-border bg-chad-surface p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={
                      trade.type === "buy"
                        ? "text-chad-accent"
                        : "text-chad-danger"
                    }
                  >
                    {trade.type === "buy" ? "bought" : "sold"}
                  </span>
                  <Link
                    href={`/trade/${trade.tokenAddress}`}
                    className="font-bold text-chad-text hover:text-chad-accent"
                  >
                    {trade.tokenSymbol}
                  </Link>
                </div>
                <span className="text-sm font-semibold">
                  {formatUsd(trade.amountUsd)}
                </span>
              </div>
              <p className="mt-1 text-xs text-chad-muted">
                {shortenAddress(trade.maker, 6)} ·{" "}
                {new Date(trade.timestamp).toLocaleTimeString()}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
