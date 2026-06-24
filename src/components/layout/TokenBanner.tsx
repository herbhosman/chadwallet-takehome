"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatPct, formatUsd, cn } from "@/lib/utils";
import type { TokenInfo } from "@/types/token";

interface TokenBannerProps {
  tokens: TokenInfo[];
  reverse?: boolean;
}

function TokenChip({ token }: { token: TokenInfo }) {
  const positive = token.change24h >= 0;
  return (
    <Link
      href={`/trade/${token.address}`}
      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-chad-border bg-chad-surface px-3 py-1.5 transition-colors hover:border-chad-accent/40 hover:bg-chad-surface-hover"
    >
      <span className="text-xs font-bold text-chad-text">{token.symbol}</span>
      <span className="text-xs text-chad-muted">{formatUsd(token.priceUsd)}</span>
      <span
        className={cn(
          "text-xs font-semibold",
          positive ? "text-chad-accent" : "text-chad-danger",
        )}
      >
        {formatPct(token.change24h)}
      </span>
    </Link>
  );
}

export function TokenBanner({ tokens, reverse = false }: TokenBannerProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || tokens.length === 0) return;

    let offset = reverse ? -track.scrollWidth / 2 : 0;
    let raf: number;

    const step = () => {
      offset += reverse ? 0.6 : -0.6;
      const half = track.scrollWidth / 2;
      if (Math.abs(offset) >= half) offset = 0;
      track.style.transform = `translateX(${offset}px)`;
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [tokens, reverse]);

  if (tokens.length === 0) return null;

  const doubled = [...tokens, ...tokens];

  return (
    <div className="relative overflow-hidden border-chad-border bg-chad-surface/80 py-2">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-chad-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-chad-bg to-transparent" />
      <div ref={trackRef} className="flex w-max gap-2 px-2 will-change-transform">
        {doubled.map((token, i) => (
          <TokenChip key={`${token.address}-${i}`} token={token} />
        ))}
      </div>
    </div>
  );
}
