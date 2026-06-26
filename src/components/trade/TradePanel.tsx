"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useSignTransaction,
  useWallets,
} from "@privy-io/react-auth/solana";
import { VersionedTransaction } from "@solana/web3.js";
import { SOL_MINT } from "@/lib/constants";
import { solToLamports } from "@/lib/jupiter";
import { formatUsd, cn } from "@/lib/utils";
import { logTrade } from "@/lib/supabase";
import type { TokenInfo } from "@/types/token";

interface TradePanelProps {
  token: TokenInfo;
}

export function TradePanel({ token }: TradePanelProps) {
  const { authenticated, user } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { signTransaction } = useSignTransaction();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("0.1");
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<{
    outAmount: string;
    priceImpactPct: string;
    requestId?: string;
    transaction?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);

  const solanaWallet = wallets[0];
  const walletAddress = solanaWallet?.address;

  const refreshBalances = useCallback(async () => {
    if (!walletAddress) return;
    const res = await fetch(
      `/api/balance?wallet=${walletAddress}&mint=${token.address}`,
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not load wallet balance");
      return;
    }
    setSolBalance(data.sol ?? 0);
    setTokenBalance(data.token ?? 0);
  }, [walletAddress, token.address]);

  useEffect(() => {
    refreshBalances();
    const onFocus = () => refreshBalances();
    window.addEventListener("focus", onFocus);
    const interval = setInterval(refreshBalances, 15_000);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [refreshBalances]);

  const fetchQuote = useCallback(async () => {
    if (!walletAddress || !amount) return;
    setError(null);
    setQuote(null);

    const inputMint = side === "buy" ? SOL_MINT : token.address;
    const outputMint = side === "buy" ? token.address : SOL_MINT;
    const rawAmount =
      side === "buy"
        ? solToLamports(parseFloat(amount))
        : String(Math.floor(parseFloat(amount) * 1e6));

    try {
      const res = await fetch(
        `/api/jupiter/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${rawAmount}&taker=${walletAddress}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Quote failed");
      setQuote({
        outAmount: data.outAmount,
        priceImpactPct: data.priceImpactPct,
        requestId: data.requestId,
        transaction: data.transaction,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Quote failed");
    }
  }, [walletAddress, amount, side, token.address]);

  useEffect(() => {
    const t = setTimeout(fetchQuote, 500);
    return () => clearTimeout(t);
  }, [fetchQuote]);

  const executeSwap = async () => {
    if (!quote?.transaction || !quote.requestId || !solanaWallet) {
      setError("No transaction to sign. Connect wallet and get a quote.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const txBytes = VersionedTransaction.deserialize(
        Buffer.from(quote.transaction, "base64"),
      ).serialize();

      const { signedTransaction } = await signTransaction({
        transaction: txBytes,
        wallet: solanaWallet,
      });

      const signedBase64 = Buffer.from(signedTransaction).toString("base64");
      const res = await fetch("/api/jupiter/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signedTransaction: signedBase64,
          requestId: quote.requestId,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Swap failed");

      setSuccess(result.signature ?? "Swap submitted");
      if (user?.id) {
        await logTrade({
          userId: user.id,
          wallet: walletAddress!,
          mint: token.address,
          symbol: token.symbol,
          side,
          amountUsd: parseFloat(amount) * (side === "buy" ? 1 : token.priceUsd),
          signature: result.signature,
        });
      }
      refreshBalances();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Swap failed");
    } finally {
      setLoading(false);
    }
  };

  const positionUsd = tokenBalance * token.priceUsd;

  return (
    <aside className="flex flex-col gap-4 rounded-xl border border-chad-border bg-chad-surface p-4">
      <div>
        <h2 className="text-sm font-bold">Trade {token.symbol}</h2>
        <p className="text-[11px] text-chad-muted">Jupiter · Alchemy RPC</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(["buy", "sell"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSide(s)}
            className={cn(
              "rounded-xl py-2.5 text-sm font-bold capitalize transition-colors",
              side === s
                ? s === "buy"
                  ? "bg-chad-accent text-black"
                  : "bg-chad-danger text-white"
                : "bg-chad-bg text-chad-muted hover:text-chad-text",
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div>
        <label className="mb-1 block text-[11px] text-chad-muted">
          {side === "buy" ? "SOL amount" : `${token.symbol} amount`}
        </label>
        <input
          type="number"
          step="any"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-xl border border-chad-border bg-chad-bg px-3 py-2.5 text-sm outline-none focus:border-chad-accent"
        />
        <div className="mt-1 flex gap-2">
          {["0.05", "0.1", "0.5", "1"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAmount(v)}
              className="rounded-lg bg-chad-bg px-2 py-0.5 text-[10px] text-chad-muted hover:text-chad-accent"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {quote && (
        <div className="space-y-1 rounded-xl bg-chad-bg p-3 text-xs">
          <div className="flex justify-between">
            <span className="text-chad-muted">Est. output</span>
            <span className="font-medium">
              {(parseInt(quote.outAmount, 10) / 1e6).toFixed(4)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-chad-muted">Price impact</span>
            <span>{parseFloat(quote.priceImpactPct).toFixed(3)}%</span>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-chad-danger/10 px-3 py-2 text-xs text-chad-danger">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg bg-chad-accent/10 px-3 py-2 text-xs text-chad-accent">
          ✓ {success}
        </p>
      )}

      <button
        type="button"
        disabled={loading || !authenticated || !walletsReady || !quote?.transaction}
        onClick={executeSwap}
        className={cn(
          "w-full rounded-2xl py-3.5 text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-40",
          side === "buy"
            ? "bg-chad-accent text-black"
            : "bg-chad-danger text-white",
        )}
      >
        {loading ? "Signing…" : `${side === "buy" ? "Buy" : "Sell"} ${token.symbol}`}
      </button>

      <div className="border-t border-chad-border pt-4">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-chad-muted">
          Your Position
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-chad-muted">SOL balance</span>
            <span>{solBalance.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-chad-muted">{token.symbol} held</span>
            <span>{tokenBalance.toFixed(4)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span className="text-chad-muted">Position value</span>
            <span className="text-chad-accent">{formatUsd(positionUsd)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
