import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";
import {
  DEFAULT_SLIPPAGE_BPS,
  JUPITER_EXECUTE_URL,
  JUPITER_ORDER_URL,
  SOL_MINT,
} from "./constants";

export function getSolanaConnection(): Connection {
  const raw = process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim();
  let rpc = "https://api.mainnet-beta.solana.com";

  if (raw) {
    try {
      const url = new URL(raw);
      url.protocol = url.protocol.toLowerCase();
      rpc = url.toString();
    } catch {
      // fall through to default
    }
  }

  return new Connection(rpc, "confirmed");
}

export function getNetwork(): "mainnet-beta" | "devnet" {
  const n = process.env.NEXT_PUBLIC_SOLANA_NETWORK;
  return n === "devnet" ? "devnet" : "mainnet-beta";
}

export interface JupiterOrderResponse {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: unknown[];
  transaction?: string;
  requestId?: string;
  error?: string;
}

export async function getJupiterOrder(params: {
  inputMint: string;
  outputMint: string;
  amount: string;
  taker: string;
  slippageBps?: number;
}): Promise<JupiterOrderResponse> {
  const search = new URLSearchParams({
    inputMint: params.inputMint,
    outputMint: params.outputMint,
    amount: params.amount,
    taker: params.taker,
    slippageBps: String(params.slippageBps ?? DEFAULT_SLIPPAGE_BPS),
  });

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  const apiKey = process.env.JUPITER_API_KEY;
  if (apiKey) headers["x-api-key"] = apiKey;

  const res = await fetch(`${JUPITER_ORDER_URL}?${search}`, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Jupiter order failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<JupiterOrderResponse>;
}

export async function executeJupiterOrder(params: {
  signedTransaction: string;
  requestId: string;
}): Promise<{ signature?: string; error?: string }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const apiKey = process.env.JUPITER_API_KEY;
  if (apiKey) headers["x-api-key"] = apiKey;

  const res = await fetch(JUPITER_EXECUTE_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      signedTransaction: params.signedTransaction,
      requestId: params.requestId,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Jupiter execute failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<{ signature?: string; error?: string }>;
}

export async function getSolBalance(wallet: string): Promise<number> {
  const conn = getSolanaConnection();
  const lamports = await conn.getBalance(new PublicKey(wallet));
  return lamports / 1e9;
}

export async function getTokenBalance(
  wallet: string,
  mint: string,
): Promise<number> {
  const conn = getSolanaConnection();
  const accounts = await conn.getParsedTokenAccountsByOwner(
    new PublicKey(wallet),
    { mint: new PublicKey(mint) },
  );
  if (!accounts.value.length) return 0;
  const info = accounts.value[0].account.data.parsed.info;
  return parseFloat(info.tokenAmount.uiAmountString ?? "0");
}

export function solToLamports(sol: number): string {
  return String(Math.floor(sol * 1e9));
}

export function deserializeTransaction(base64: string): VersionedTransaction {
  const buf = Buffer.from(base64, "base64");
  return VersionedTransaction.deserialize(buf);
}

export { SOL_MINT };
