"use client";

import Link from "next/link";
import { TokenAvatar } from "@/components/ui/TokenAvatar";
import { formatCompact, formatPct, formatUsd, cn } from "@/lib/utils";
import type { TokenInfo } from "@/types/token";

interface TrendingSidebarProps {
  tokens: TokenInfo[];
  activeMint: string;
}

export function TrendingSidebar({ tokens, activeMint }: TrendingSidebarProps) {
  return (
    <aside className="flex flex-col overflow-hidden rounded-xl border border-chad-border bg-chad-surface">
      <div className="border-b border-chad-border px-4 py-3">
        <h2 className="text-sm font-bold text-chad-text">Trending</h2>
        <p className="text-[11px] text-chad-muted">24h volume leaders</p>
      </div>
      <ul className="flex-1 overflow-y-auto">
        {tokens.map((token, i) => {
          const active = token.address === activeMint;
          const positive = token.change24h >= 0;
          return (
            <li key={token.address}>
              <Link
                href={`/trade/${token.address}`}
                className={cn(
                  "flex items-center gap-3 border-b border-chad-border/50 px-4 py-3 transition-colors hover:bg-chad-surface-hover",
                  active && "bg-chad-accent/5 border-l-2 border-l-chad-accent",
                )}
              >
                <span className="w-5 text-xs text-chad-muted">{i + 1}</span>
                <TokenAvatar
                  symbol={token.symbol}
                  imageUrl={token.imageUrl}
                  size={28}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{token.symbol}</span>
                    <span className="truncate text-[11px] text-chad-muted">
                      {token.name}
                    </span>
                  </div>
                  <div className="text-[11px] text-chad-muted">
                    Vol {formatCompact(token.volume24h)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium">
                    {formatUsd(token.priceUsd)}
                  </div>
                  <div
                    className={cn(
                      "text-[11px] font-semibold",
                      positive ? "text-chad-accent" : "text-chad-danger",
                    )}
                  >
                    {formatPct(token.change24h)}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
