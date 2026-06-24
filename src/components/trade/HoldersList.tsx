"use client";

import { shortenAddress, formatCompact, formatUsd } from "@/lib/utils";
import type { TokenHolder } from "@/types/token";

export function HoldersList({ holders }: { holders: TokenHolder[] }) {
  return (
    <div className="rounded-xl border border-chad-border bg-chad-surface">
      <div className="border-b border-chad-border px-4 py-3">
        <h3 className="text-sm font-bold">Top Holders</h3>
      </div>
      <ul className="max-h-48 overflow-y-auto">
        {holders.length === 0 ? (
          <li className="px-4 py-6 text-center text-xs text-chad-muted">
            No holder data
          </li>
        ) : (
          holders.map((h, i) => (
            <li
              key={h.address}
              className="flex items-center justify-between border-b border-chad-border/40 px-4 py-2 text-xs last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="w-4 text-chad-muted">{i + 1}</span>
                <span className="font-mono text-chad-text">
                  {shortenAddress(h.address, 6)}
                </span>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatUsd(h.balanceUsd)}</div>
                <div className="text-chad-muted">
                  {h.pctHeld.toFixed(1)}% · {formatCompact(h.balance)}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
