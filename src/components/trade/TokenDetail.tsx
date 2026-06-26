"use client";

import { useState } from "react";
import { formatCompact, formatPct, formatUsd, cn } from "@/lib/utils";
import { getTradingViewSymbol } from "@/lib/tradingview";
import { TradingChart } from "./TradingChart";
import { TradingViewWidget } from "./TradingViewWidget";
import { HoldersList } from "./HoldersList";
import { LiveTrades } from "./LiveTrades";
import type { LiveTrade, TokenBar, TokenHolder, TokenInfo } from "@/types/token";

interface TokenDetailProps {
  token: TokenInfo;
  bars: TokenBar[];
  holders: TokenHolder[];
  trades: LiveTrade[];
}

export function TokenDetail({ token, bars, holders, trades }: TokenDetailProps) {
  const positive = token.change24h >= 0;
  const tvSymbol = getTradingViewSymbol(token);
  const [chartMode, setChartMode] = useState<"codex" | "tradingview">("codex");

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-chad-border bg-chad-surface p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{token.symbol}</h1>
              <span className="text-sm text-chad-muted">{token.name}</span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-chad-muted">
              {token.address}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatUsd(token.priceUsd)}</div>
            <div
              className={cn(
                "text-sm font-semibold",
                positive ? "text-chad-accent" : "text-chad-danger",
              )}
            >
              {formatPct(token.change24h)} 24h
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
          <Stat label="Volume 24h" value={formatCompact(token.volume24h)} />
          <Stat
            label="Market Cap"
            value={token.marketCap ? formatCompact(token.marketCap) : "—"}
          />
          <Stat
            label="Liquidity"
            value={token.liquidity ? formatCompact(token.liquidity) : "—"}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setChartMode("codex")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
              chartMode === "codex"
                ? "bg-chad-accent text-black"
                : "bg-chad-surface text-chad-muted hover:text-chad-text",
            )}
          >
            Codex OHLCV
          </button>
          {tvSymbol ? (
            <button
              type="button"
              onClick={() => setChartMode("tradingview")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                chartMode === "tradingview"
                  ? "bg-chad-accent text-black"
                  : "bg-chad-surface text-chad-muted hover:text-chad-text",
              )}
            >
              TradingView
            </button>
          ) : null}
        </div>

        {chartMode === "tradingview" && tvSymbol ? (
          <TradingViewWidget symbol={tvSymbol} />
        ) : (
          <TradingChart bars={bars} />
        )}
      </div>
      <HoldersList holders={holders} />
      <LiveTrades initialTrades={trades} mint={token.address} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-chad-bg px-2 py-2">
      <div className="text-chad-muted">{label}</div>
      <div className="mt-0.5 font-semibold text-chad-text">{value}</div>
    </div>
  );
}
