import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key);
  return client;
}

export async function logTrade(params: {
  userId: string;
  wallet: string;
  mint: string;
  symbol: string;
  side: "buy" | "sell";
  amountUsd: number;
  signature?: string;
}) {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("trades").insert({
    user_id: params.userId,
    wallet_address: params.wallet,
    token_mint: params.mint,
    token_symbol: params.symbol,
    side: params.side,
    amount_usd: params.amountUsd,
    tx_signature: params.signature,
  });
}

export async function getWatchlist(userId: string): Promise<string[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("watchlist")
    .select("token_mint")
    .eq("user_id", userId);
  return (data ?? []).map((r) => r.token_mint as string);
}

export async function toggleWatchlist(
  userId: string,
  mint: string,
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  const { data: existing } = await sb
    .from("watchlist")
    .select("id")
    .eq("user_id", userId)
    .eq("token_mint", mint)
    .maybeSingle();

  if (existing) {
    await sb.from("watchlist").delete().eq("id", existing.id);
    return false;
  }

  await sb.from("watchlist").insert({ user_id: userId, token_mint: mint });
  return true;
}
