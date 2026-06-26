import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, wallet, mint, symbol, side, amountUsd, signature } = body;

  if (!userId || !wallet || !mint || !symbol || !side) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (side !== "buy" && side !== "sell") {
    return NextResponse.json({ error: "Invalid side" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { error } = await sb.from("trades").insert({
    user_id: userId,
    wallet_address: wallet,
    token_mint: mint,
    token_symbol: symbol,
    side,
    amount_usd: amountUsd ?? null,
    tx_signature: signature ?? null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
