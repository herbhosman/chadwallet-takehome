"use client";

import dynamic from "next/dynamic";
import { AppShell } from "@/components/layout/AppShell";
import { TrendingSidebar } from "@/components/trade/TrendingSidebar";
import { TokenDetail } from "@/components/trade/TokenDetail";
import type { LiveTrade, TokenBar, TokenHolder, TokenInfo } from "@/types/token";

const TradePanel = dynamic(
  () => import("@/components/trade/TradePanel").then((m) => m.TradePanel),
  {
    ssr: false,
    loading: () => (
      <aside className="animate-pulse rounded-xl border border-chad-border bg-chad-surface p-4">
        <div className="mb-4 h-4 w-24 rounded bg-chad-border" />
        <div className="h-10 rounded-xl bg-chad-border" />
      </aside>
    ),
  },
);

interface TradePageClientProps {
  mint: string;
  token: TokenInfo;
  trending: TokenInfo[];
  bars: TokenBar[];
  barsLive: boolean;
  holders: TokenHolder[];
  holdersLive: boolean;
  trades: LiveTrade[];
  tradesLive: boolean;
}

export function TradePageClient({
  mint,
  token,
  trending,
  bars,
  barsLive,
  holders,
  holdersLive,
  trades,
  tradesLive,
}: TradePageClientProps) {
  return (
    <AppShell tokens={trending} hideNav>
      <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl grid-cols-1 gap-4 p-4 lg:grid-cols-[240px_1fr_300px]">
        <div className="hidden lg:block">
          <TrendingSidebar tokens={trending} activeMint={mint} />
        </div>
        <TokenDetail
          token={token}
          bars={bars}
          barsLive={barsLive}
          holders={holders}
          holdersLive={holdersLive}
          trades={trades}
          tradesLive={tradesLive}
        />
        <TradePanel token={token} />
      </div>
    </AppShell>
  );
}
