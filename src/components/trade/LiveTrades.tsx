"use client";

import { useEffect, useState } from "react";
import { shortenAddress, formatUsd } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { LiveTrade } from "@/types/token";

export function LiveTrades({
  initialTrades,
  mint,
}: {
  initialTrades: LiveTrade[];
  mint: string;
}) {
  const [trades, setTrades] = useState(initialTrades);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/codex", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query LiveTrades($address: String!, $networkId: Int!) {
                getTokenEvents(
                  query: { address: $address, networkId: $networkId, eventType: Swap }
                  limit: 10
                  direction: DESC
                ) {
                  items {
                    id timestamp maker
                    data { ... on SwapEventData { priceUsdTotal priceUsd amount0 } }
                  }
                }
              }
            `,
            variables: { address: mint, networkId: 1399811149 },
          }),
        });
        if (!res.ok) return;
        const json = await res.json();
        const items = json.data?.getTokenEvents?.items ?? [];
        if (items.length) {
          setTrades(
            items.map(
              (item: {
                id: string;
                timestamp: number;
                maker: string;
                data: { priceUsdTotal?: string; priceUsd?: string; amount0?: string };
              }) => ({
                id: item.id,
                timestamp: item.timestamp * 1000,
                type:
                  parseFloat(item.data.amount0 ?? "0") > 0
                    ? ("buy" as const)
                    : ("sell" as const),
                amountUsd: parseFloat(item.data.priceUsdTotal ?? "0"),
                amountToken: Math.abs(parseFloat(item.data.amount0 ?? "0")),
                priceUsd: parseFloat(item.data.priceUsd ?? "0"),
                maker: item.maker,
              }),
            ),
          );
        }
      } catch {
        /* polling fallback silent */
      }
    }, 15_000);
    return () => clearInterval(interval);
  }, [mint]);

  return (
    <div className="rounded-xl border border-chad-border bg-chad-surface">
      <div className="flex items-center justify-between border-b border-chad-border px-4 py-3">
        <h3 className="text-sm font-bold">Live Trades</h3>
        <span className="flex items-center gap-1.5 text-[10px] text-chad-accent">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-chad-accent" />
          LIVE
        </span>
      </div>
      <ul className="max-h-56 overflow-y-auto">
        {trades.map((t, i) => (
          <li
            key={`${t.id}-${t.timestamp}-${i}`}
            className="flex items-center justify-between border-b border-chad-border/40 px-4 py-2 text-xs last:border-0"
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                  t.type === "buy"
                    ? "bg-chad-accent/15 text-chad-accent"
                    : "bg-chad-danger/15 text-chad-danger",
                )}
              >
                {t.type}
              </span>
              <span className="font-mono text-chad-muted">
                {shortenAddress(t.maker, 4)}
              </span>
            </div>
            <span className="font-medium">{formatUsd(t.amountUsd)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
