"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { TokenBanner } from "./TokenBanner";
import { BottomNav } from "./BottomNav";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { WalletProvisioner } from "@/components/auth/WalletProvisioner";
import type { TokenInfo } from "@/types/token";

interface AppShellProps {
  children: React.ReactNode;
  tokens: TokenInfo[];
  hideNav?: boolean;
}

const hasPrivy = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);

export function AppShell(props: AppShellProps) {
  if (hasPrivy) {
    return <PrivyGate {...props} />;
  }
  return <ShellLayout {...props} authSlot={<DemoBadge />} />;
}

function PrivyGate(props: AppShellProps) {
  const [mounted, setMounted] = useState(false);
  const { ready, authenticated } = usePrivy();

  useEffect(() => setMounted(true), []);

  if (!mounted || !ready) {
    return <BootScreen message="Loading ChadWallet…" />;
  }

  if (!authenticated) {
    return <LoginScreen />;
  }

  return (
    <>
      <WalletProvisioner />
      <ShellLayout {...props} authSlot={<PrivyAuthPill />} />
    </>
  );
}

function BootScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-chad-bg">
      <p className="text-sm text-chad-muted">{message}</p>
    </div>
  );
}

function ShellLayout({
  children,
  tokens,
  hideNav = false,
  authSlot,
}: AppShellProps & { authSlot: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-chad-bg text-chad-text">
      <header className="sticky top-0 z-40 border-b border-chad-border bg-chad-bg/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/chadwallet-logo.svg"
              alt="ChadWallet"
              width={32}
              height={32}
            />
            <span className="text-lg font-black tracking-tight">
              Chad<span className="text-chad-accent">Wallet</span>
            </span>
          </Link>
          {authSlot}
        </div>
        <TokenBanner tokens={tokens} />
      </header>

      <main className={hideNav ? "flex-1" : "flex-1 pb-20"}>{children}</main>

      {!hideNav && (
        <>
          <div className="fixed bottom-16 left-0 right-0 z-40">
            <TokenBanner tokens={tokens} reverse />
          </div>
          <BottomNav />
        </>
      )}
    </div>
  );
}

function DemoBadge() {
  return (
    <span className="rounded-full bg-chad-surface px-3 py-1 text-xs text-chad-muted">
      Demo mode
    </span>
  );
}

function PrivyAuthPill() {
  const { authenticated, user, logout } = usePrivy();
  const { wallets } = useWallets();

  if (!authenticated) return null;

  const wallet = wallets[0]?.address;
  const label = wallet
    ? `${wallet.slice(0, 4)}…${wallet.slice(-4)}`
    : user?.email?.address?.split("@")[0] ?? "Connected";

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-full border border-chad-border bg-chad-surface px-3 py-1 text-xs font-medium text-chad-accent transition-colors hover:border-chad-accent/50"
      title="Sign out"
    >
      {label}
    </button>
  );
}
