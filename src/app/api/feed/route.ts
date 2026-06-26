import { NextResponse } from "next/server";
import { fetchFeedTrades } from "@/lib/codex";
import { generateMockTrades } from "@/lib/mock-data";
import type { FeedTrade } from "@/types/token";

export const revalidate = 15;

export async function GET() {
  const trades = await fetchFeedTrades(30);

  if (trades.length > 0) {
    return NextResponse.json(trades);
  }

  const fallback: FeedTrade[] = generateMockTrades().map((t, i) => ({
    ...t,
    tokenAddress: `mock-${i}`,
    tokenSymbol: ["GTAV1", "SOL", "BONK", "WIF", "JUP", "RAY"][i % 6],
  }));

  return NextResponse.json(fallback);
}
