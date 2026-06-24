import { TradePageClient } from "@/components/trade/TradePageClient";
import {
  fetchTrendingTokens,
  fetchTokenBars,
  fetchTokenMetadata,
  fetchHolders,
  fetchLiveTrades,
} from "@/lib/codex";
import {
  generateMockBars,
  generateMockHolders,
  generateMockTrades,
  getMockToken,
} from "@/lib/mock-data";

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

  const chartBars = bars.length > 0 ? bars : generateMockBars();
  const holderData = holders.length > 0 ? holders : generateMockHolders();
  const tradeData = trades.length > 0 ? trades : generateMockTrades();

  return (
    <TradePageClient
      mint={mint}
      token={token}
      trending={trending}
      bars={chartBars}
      holders={holderData}
      trades={tradeData}
    />
  );
}
