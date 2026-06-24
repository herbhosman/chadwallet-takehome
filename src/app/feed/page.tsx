"use client";

import useSWR from "swr";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { formatUsd, shortenAddress } from "@/lib/utils";
import type { TokenInfo } from "@/types/token";
import { MOCK_TRENDING } from "@/lib/mock-data";
import { generateMockTrades } from "@/lib/mock-data";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function FeedPage() {
  const { data: tokens = MOCK_TRENDING } = useSWR<TokenInfo[]>(
    "/api/trending",
    fetcher,
    { fallbackData: MOCK_TRENDING },
  );
  const trades = generateMockTrades();

  return (
    <AppShell tokens={tokens}>
      <div className="mx-auto max-w-lg space-y-4 px-4 py-6">
        <h1 className="text-xl font-black">Social Feed</h1>
        <p className="text-sm text-chad-muted">
          Real-time trades across the community
        </p>
        <ul className="space-y-3">
          {trades.map((trade, i) => {
            const token = tokens[i % tokens.length];
            return (
              <li
                key={trade.id}
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
                      href={`/trade/${token.address}`}
                      className="font-bold text-chad-text hover:text-chad-accent"
                    >
                      {token.symbol}
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
            );
          })}
        </ul>
      </div>
    </AppShell>
  );
}
