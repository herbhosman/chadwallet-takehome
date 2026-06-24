"use client";

import { useEffect, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useCreateWallet, useWallets } from "@privy-io/react-auth/solana";

export function WalletProvisioner() {
  const { ready, authenticated } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { createWallet } = useCreateWallet();
  const [error, setError] = useState<string | null>(null);
  const attempted = useRef(false);

  useEffect(() => {
    if (!ready || !authenticated || !walletsReady) return;
    if (wallets.length > 0) return;
    if (attempted.current) return;

    attempted.current = true;
    createWallet()
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Wallet setup failed";
        setError(message);
        attempted.current = false;
      });
  }, [ready, authenticated, walletsReady, wallets.length, createWallet]);

  if (!ready || !authenticated) return null;
  if (walletsReady && wallets.length > 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-chad-bg/95 backdrop-blur-sm">
      <div className="mx-4 max-w-sm rounded-2xl border border-chad-border bg-chad-surface p-8 text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-chad-border border-t-chad-accent" />
        <p className="font-bold text-chad-text">Creating your wallet</p>
        <p className="mt-1 text-sm text-chad-muted">Please wait…</p>
        {error && (
          <p className="mt-4 text-xs text-chad-danger">{error}</p>
        )}
      </div>
    </div>
  );
}
