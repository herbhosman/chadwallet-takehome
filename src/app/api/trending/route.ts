import { NextResponse } from "next/server";
import { fetchTrendingTokens } from "@/lib/codex";

export const revalidate = 30;

export async function GET() {
  const tokens = await fetchTrendingTokens(30);
  return NextResponse.json(tokens);
}
