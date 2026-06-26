import { SOL_MINT } from "./constants";

/** Jupiter/Codex raw integer amount → human-readable units. */
export function rawToUnits(raw: string | number, decimals: number): number {
  const n = typeof raw === "string" ? parseInt(raw, 10) : raw;
  if (!Number.isFinite(n)) return 0;
  return n / 10 ** decimals;
}

export function unitsToRaw(amount: number, decimals: number): string {
  return String(Math.floor(amount * 10 ** decimals));
}

export function outputDecimals(
  side: "buy" | "sell",
  tokenDecimals: number,
): number {
  return side === "buy" ? tokenDecimals : 9;
}

export function inputDecimals(
  side: "buy" | "sell",
  tokenDecimals: number,
): number {
  return side === "buy" ? 9 : tokenDecimals;
}

export function defaultDecimalsForMint(mint: string): number {
  return mint === SOL_MINT ? 9 : 6;
}

export function formatTokenAmount(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "0";
  if (value >= 1000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  if (value >= 1) return value.toFixed(4);
  if (value >= 0.0001) return value.toFixed(6);
  return value.toPrecision(4);
}
