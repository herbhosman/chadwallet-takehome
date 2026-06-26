"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import useSWR from "swr";
import { Copy, LogOut } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { BRAND } from "@/lib/branding";
import { formatPct, formatUsd } from "@/lib/utils";
import type { TokenInfo } from "@/types/token";
import { MOCK_TRENDING } from "@/lib/mock-data";

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const hasPrivy = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);

function solPriceUsd(tokens: TokenInfo[]): number {
  return tokens.find((t) => t.symbol === "SOL")?.priceUsd ?? 0;
}

export default function ProfilePage() {
  if (hasPrivy) {
    return <PrivyProfilePage />;
  }
  return <ProfileContent wallet={undefined} solBalance={0} email={undefined} onLogout={undefined} />;
}

function PrivyProfilePage() {
  const { ready, authenticated, user, logout } = usePrivy();
  const { wallets } = useWallets();
  const [solBalance, setSolBalance] = useState(0);
  const wallet = wallets[0]?.address;

  useEffect(() => {
    if (!wallet) return;
    const load = () =>
      fetch(`/api/balance?wallet=${wallet}`)
        .then((r) => r.json())
        .then((d) => setSolBalance(d.sol ?? 0))
        .catch(() => {});

    load();
    const interval = setInterval(load, 15_000);
    return () => clearInterval(interval);
  }, [wallet]);

  if (ready && !authenticated) {
    return <LoginScreen />;
  }

  return (
    <ProfileContent
      wallet={wallet}
      solBalance={solBalance}
      email={user?.email?.address}
      onLogout={logout}
    />
  );
}

function ProfileContent({
  wallet,
  solBalance,
  email,
  onLogout,
}: {
  wallet?: string;
  solBalance: number;
  email?: string;
  onLogout?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const { data: tokens = MOCK_TRENDING } = useSWR<TokenInfo[]>(
    "/api/trending",
    fetcher,
    { fallbackData: MOCK_TRENDING },
  );

  const solUsd = solPriceUsd(tokens);
  const portfolioUsd = solBalance * (solUsd || 150);

  const copyWallet = async () => {
    if (!wallet) return;
    await navigator.clipboard.writeText(wallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell tokens={tokens}>
      <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
        <div className="relative overflow-hidden rounded-2xl border border-chad-border bg-chad-surface p-6 text-center">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              background:
                "linear-gradient(180deg, #5eb8ff 0%, #7ee8b0 60%, transparent 100%)",
            }}
          />
          <div className="relative">
            <Image
              src={BRAND.logoLight}
              alt="ChadWallet"
              width={72}
              height={72}
              className="mx-auto mb-3 rounded-2xl"
            />
            <h1 className="text-xl font-black">
              Chad<span className="text-chad-accent">Wallet</span>
            </h1>
            {email && (
              <p className="mt-1 text-sm text-chad-muted">{email}</p>
            )}
            {wallet && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <p className="font-mono text-xs text-chad-muted">
                  {wallet.slice(0, 8)}…{wallet.slice(-8)}
                </p>
                <button
                  type="button"
                  onClick={copyWallet}
                  className="rounded-lg border border-chad-border p-1.5 text-chad-muted hover:text-chad-accent"
                  aria-label="Copy wallet address"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {copied && (
              <p className="mt-1 text-[10px] text-chad-accent">Copied!</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-chad-border bg-chad-surface p-4 text-center">
            <div className="text-xs text-chad-muted">Portfolio</div>
            <div className="mt-1 text-lg font-bold text-chad-accent">
              {formatUsd(portfolioUsd)}
            </div>
          </div>
          <div className="rounded-xl border border-chad-border bg-chad-surface p-4 text-center">
            <div className="text-xs text-chad-muted">SOL balance</div>
            <div className="mt-1 text-lg font-bold">{solBalance.toFixed(4)}</div>
          </div>
        </div>

        <section>
          <h2 className="mb-2 text-sm font-bold">Quick trade</h2>
          <ul className="space-y-2">
            {tokens.slice(0, 5).map((token) => (
              <li key={token.address}>
                <Link
                  href={`/trade/${token.address}`}
                  className="flex items-center justify-between rounded-xl border border-chad-border bg-chad-surface px-4 py-3 text-sm transition-colors hover:border-chad-accent/30"
                >
                  <div>
                    <span className="font-bold">{token.symbol}</span>
                    <span className="ml-2 text-xs text-chad-muted">
                      {formatPct(token.change24h)}
                    </span>
                  </div>
                  <span>{formatUsd(token.priceUsd)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-chad-border py-3 text-sm font-medium text-chad-muted transition-colors hover:border-chad-danger/50 hover:text-chad-danger"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        )}
      </div>
    </AppShell>
  );
}
