"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import useSWR from "swr";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { formatUsd } from "@/lib/utils";
import type { TokenInfo } from "@/types/token";
import { MOCK_TRENDING } from "@/lib/mock-data";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const hasPrivy = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);

export default function ProfilePage() {
  if (hasPrivy) {
    return <PrivyProfilePage />;
  }
  return <ProfileContent wallet={undefined} solBalance={0} />;
}

function PrivyProfilePage() {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [solBalance, setSolBalance] = useState(0);
  const wallet = wallets[0]?.address;

  useEffect(() => {
    if (!wallet) return;
    fetch(`/api/balance?wallet=${wallet}`)
      .then((r) => r.json())
      .then((d) => setSolBalance(d.sol ?? 0))
      .catch(() => {});
  }, [wallet]);

  if (ready && !authenticated) {
    return <LoginScreen />;
  }

  return <ProfileContent wallet={wallet} solBalance={solBalance} />;
}

function ProfileContent({
  wallet,
  solBalance,
}: {
  wallet?: string;
  solBalance: number;
}) {
  const { data: tokens = MOCK_TRENDING } = useSWR<TokenInfo[]>(
    "/api/trending",
    fetcher,
    { fallbackData: MOCK_TRENDING },
  );

  return (
    <AppShell tokens={tokens}>
      <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
        <div className="rounded-2xl border border-chad-border bg-chad-surface p-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-chad-accent text-2xl font-black text-black">
            C
          </div>
          <h1 className="text-xl font-black">Chad Trader</h1>
          {wallet && (
            <p className="mt-1 font-mono text-xs text-chad-muted">{wallet}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-chad-border bg-chad-surface p-4 text-center">
            <div className="text-xs text-chad-muted">Portfolio</div>
            <div className="mt-1 text-lg font-bold text-chad-accent">
              {formatUsd(solBalance * 150)}
            </div>
          </div>
          <div className="rounded-xl border border-chad-border bg-chad-surface p-4 text-center">
            <div className="text-xs text-chad-muted">SOL</div>
            <div className="mt-1 text-lg font-bold">{solBalance.toFixed(4)}</div>
          </div>
        </div>

        <section>
          <h2 className="mb-2 text-sm font-bold">Quick trade</h2>
          <ul className="space-y-2">
            {tokens.slice(0, 4).map((token) => (
              <li key={token.address}>
                <Link
                  href={`/trade/${token.address}`}
                  className="flex items-center justify-between rounded-xl border border-chad-border bg-chad-surface px-4 py-3 text-sm hover:border-chad-accent/30"
                >
                  <span className="font-bold">{token.symbol}</span>
                  <span>{formatUsd(token.priceUsd)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
