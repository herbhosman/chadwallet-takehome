import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SOLANA_NETWORK_ID } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUsd(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (n == null || Number.isNaN(n)) return "$0.00";
  if (n < 0.0001) return `$${n.toExponential(2)}`;
  if (n < 1) return `$${n.toFixed(4)}`;
  if (n < 1000) return `$${n.toFixed(2)}`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function formatPct(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (n == null || Number.isNaN(n)) return "0.00%";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(2);
}

export function shortenAddress(addr: string, chars = 4): string {
  if (!addr) return "";
  return `${addr.slice(0, chars)}…${addr.slice(-chars)}`;
}

export function tokenSymbolKey(address: string): string {
  return `${address}:${SOLANA_NETWORK_ID}`;
}
