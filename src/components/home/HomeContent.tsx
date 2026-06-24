import Link from "next/link";
import { TrendingUp, Zap, Users } from "lucide-react";
import { formatPct, formatUsd, cn } from "@/lib/utils";
import type { TokenInfo } from "@/types/token";

export function HomeContent({ tokens }: { tokens: TokenInfo[] }) {
  const featured = tokens.slice(0, 6);

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-chad-accent">
          Never miss out again
        </p>
        <h1 className="text-3xl font-black leading-tight">
          Where traders
          <br />
          become <span className="text-chad-accent">legends</span>
        </h1>
        <p className="text-sm text-chad-muted">
          Trade Solana memecoins in seconds. Social-first, gasless, one tap to
          buy.
        </p>
      </section>

      <section className="grid grid-cols-3 gap-2">
        <FeatureCard icon={TrendingUp} label="Trending" />
        <FeatureCard icon={Zap} label="Gasless" />
        <FeatureCard icon={Users} label="Social" />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">🔥 Trending now</h2>
          <Link href="/search" className="text-xs text-chad-accent">
            See all
          </Link>
        </div>
        <ul className="space-y-2">
          {featured.map((token, i) => (
            <TokenRow key={token.address} token={token} rank={i + 1} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-chad-border bg-chad-surface p-3 text-center">
      <Icon className="mx-auto mb-1 h-5 w-5 text-chad-accent" />
      <span className="text-[11px] font-medium">{label}</span>
    </div>
  );
}

function TokenRow({ token, rank }: { token: TokenInfo; rank: number }) {
  const positive = token.change24h >= 0;
  return (
    <li>
      <Link
        href={`/trade/${token.address}`}
        className="flex items-center gap-3 rounded-xl border border-chad-border bg-chad-surface px-4 py-3 transition-colors hover:border-chad-accent/30"
      >
        <span className="text-lg font-black text-chad-muted">{rank}</span>
        <div className="min-w-0 flex-1">
          <div className="font-bold">{token.symbol}</div>
          <div className="truncate text-xs text-chad-muted">{token.name}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold">{formatUsd(token.priceUsd)}</div>
          <div
            className={cn(
              "text-xs font-bold",
              positive ? "text-chad-accent" : "text-chad-danger",
            )}
          >
            {formatPct(token.change24h)}
          </div>
        </div>
      </Link>
    </li>
  );
}
