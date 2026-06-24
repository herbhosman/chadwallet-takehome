"use client";

import useSWR from "swr";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { formatPct, formatUsd, cn } from "@/lib/utils";
import type { TokenInfo } from "@/types/token";
import { MOCK_TRENDING } from "@/lib/mock-data";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const MOCK_TRADERS = [
  { name: "chad_alpha", pnl: 48200, winRate: 72 },
  { name: "sol_degen", pnl: 31800, winRate: 65 },
  { name: "moon_caller", pnl: 29400, winRate: 58 },
  { name: "wagmi_wizard", pnl: 22100, winRate: 61 },
  { name: "bonk_king", pnl: 18700, winRate: 54 },
];

export default function LeaderboardPage() {
  const { data: tokens = MOCK_TRENDING } = useSWR<TokenInfo[]>(
    "/api/trending",
    fetcher,
    { fallbackData: MOCK_TRENDING },
  );

  return (
    <AppShell tokens={tokens}>
      <div className="mx-auto max-w-lg space-y-4 px-4 py-6">
        <h1 className="text-xl font-black">Leaderboard</h1>
        <p className="text-sm text-chad-muted">Top traders · 24h PnL</p>
        <ul className="space-y-2">
          {MOCK_TRADERS.map((trader, i) => (
            <li
              key={trader.name}
              className="flex items-center gap-4 rounded-xl border border-chad-border bg-chad-surface px-4 py-3"
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-black",
                  i === 0
                    ? "bg-chad-accent text-black"
                    : "bg-chad-bg text-chad-muted",
                )}
              >
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="font-bold">@{trader.name}</div>
                <div className="text-xs text-chad-muted">
                  {trader.winRate}% win rate
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-chad-accent">
                  +{formatUsd(trader.pnl)}
                </div>
                <div className="text-[10px] text-chad-muted">24h</div>
              </div>
            </li>
          ))}
        </ul>
        <section>
          <h2 className="mb-2 text-sm font-bold">Top tokens</h2>
          <ul className="space-y-2">
            {tokens.slice(0, 5).map((token, i) => (
              <li key={token.address}>
                <Link
                  href={`/trade/${token.address}`}
                  className="flex items-center justify-between rounded-xl border border-chad-border bg-chad-surface px-4 py-2 text-sm"
                >
                  <span>
                    #{i + 1} {token.symbol}
                  </span>
                  <span
                    className={cn(
                      "font-bold",
                      token.change24h >= 0
                        ? "text-chad-accent"
                        : "text-chad-danger",
                    )}
                  >
                    {formatPct(token.change24h)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
