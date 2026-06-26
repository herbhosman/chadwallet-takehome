import { TradePageClient } from "@/components/trade/TradePageClient";
import {
  fetchTrendingTokens,
  fetchTokenBars,
  fetchTokenMetadata,
  fetchHolders,
  fetchLiveTrades,
} from "@/lib/codex";
import { generateMockBars, getMockToken } from "@/lib/mock-data";

export const revalidate = 15;

interface PageProps {
  params: Promise<{ mint: string }>;
}

export default async function TradePage({ params }: PageProps) {
  const { mint } = await params;

  const [trending, metadata, bars, holders, trades] = await Promise.all([
    fetchTrendingTokens(25),
    fetchTokenMetadata(mint),
    fetchTokenBars(mint),
    fetchHolders(mint),
    fetchLiveTrades(mint),
  ]);

  const token =
    metadata ??
    trending.find((t) => t.address === mint) ??
    getMockToken(mint);

  const barsLive = bars.length > 0;
  const chartBars = barsLive ? bars : generateMockBars();

  return (
    <TradePageClient
      mint={mint}
      token={token}
      trending={trending}
      bars={chartBars}
      barsLive={barsLive}
      holders={holders}
      holdersLive={holders.length > 0}
      trades={trades}
      tradesLive={trades.length > 0}
    />
  );
}
