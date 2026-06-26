import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json({ mints: [] });
  }

  const { data, error } = await sb
    .from("watchlist")
    .select("token_mint")
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    mints: (data ?? []).map((r) => r.token_mint as string),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, mint } = body;

  if (!userId || !mint) {
    return NextResponse.json({ error: "userId and mint required" }, { status: 400 });
  }

  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data: existing } = await sb
    .from("watchlist")
    .select("id")
    .eq("user_id", userId)
    .eq("token_mint", mint)
    .maybeSingle();

  if (existing) {
    const { error } = await sb.from("watchlist").delete().eq("id", existing.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ watching: false });
  }

  const { error } = await sb
    .from("watchlist")
    .insert({ user_id: userId, token_mint: mint });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ watching: true });
}
