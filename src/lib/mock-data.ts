import type { LiveTrade, TokenBar, TokenHolder, TokenInfo } from "@/types/token";

export const MOCK_TRENDING: TokenInfo[] = [
  {
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    name: "Bonk",
    symbol: "BONK",
    priceUsd: 0.00002134,
    change24h: 12.4,
    volume24h: 48_200_000,
    marketCap: 1_500_000_000,
    liquidity: 12_400_000,
  },
  {
    address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    name: "Jupiter",
    symbol: "JUP",
    priceUsd: 0.89,
    change24h: -3.2,
    volume24h: 32_100_000,
    marketCap: 1_200_000_000,
    liquidity: 8_900_000,
  },
  {
    address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    name: "dogwifhat",
    symbol: "WIF",
    priceUsd: 1.42,
    change24h: 8.7,
    volume24h: 89_500_000,
    marketCap: 1_400_000_000,
    liquidity: 15_200_000,
  },
  {
    address: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
    name: "Popcat",
    symbol: "POPCAT",
    priceUsd: 0.52,
    change24h: 22.1,
    volume24h: 18_700_000,
    marketCap: 510_000_000,
    liquidity: 4_200_000,
  },
  {
    address: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
    name: "Pyth Network",
    symbol: "PYTH",
    priceUsd: 0.31,
    change24h: -1.8,
    volume24h: 9_400_000,
    marketCap: 1_100_000_000,
    liquidity: 3_100_000,
  },
  {
    address: "9wK8yN6iz1ie5kEJkvZCTxyN1x5sTdNfx8yeMY8Ebonk",
    name: "BONK Variant",
    symbol: "BONK2",
    priceUsd: 0.0000189,
    change24h: 45.2,
    volume24h: 2_100_000,
    marketCap: 12_000_000,
    liquidity: 890_000,
  },
];

export function getMockToken(mint: string): TokenInfo {
  return (
    MOCK_TRENDING.find((t) => t.address === mint) ?? {
      address: mint,
      name: "Unknown Token",
      symbol: mint.slice(0, 4).toUpperCase(),
      priceUsd: 0.001,
      change24h: 0,
      volume24h: 0,
    }
  );
}

export function generateMockBars(hours = 48): TokenBar[] {
  const bars: TokenBar[] = [];
  let price = 0.001 + Math.random() * 0.01;
  const now = Math.floor(Date.now() / 1000);
  for (let i = hours; i >= 0; i--) {
    const change = (Math.random() - 0.48) * 0.08;
    const open = price;
    price = Math.max(0.000001, price * (1 + change));
    const high = Math.max(open, price) * (1 + Math.random() * 0.02);
    const low = Math.min(open, price) * (1 - Math.random() * 0.02);
    bars.push({
      time: now - i * 3600,
      open,
      high,
      low,
      close: price,
      volume: Math.random() * 500_000,
    });
  }
  return bars;
}

export function generateMockHolders(): TokenHolder[] {
  return Array.from({ length: 12 }, (_, i) => ({
    address: `${i.toString(16).padStart(4, "0")}x${"A".repeat(36)}`.slice(0, 44),
    balance: Math.random() * 10_000_000,
    balanceUsd: Math.random() * 500_000,
    pctHeld: Math.max(0.1, 15 - i * 1.2),
  }));
}

export function generateMockTrades(): LiveTrade[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `trade-${i}`,
    timestamp: Date.now() - i * 45_000,
    type: Math.random() > 0.5 ? "buy" : "sell",
    amountUsd: Math.random() * 5000 + 50,
    amountToken: Math.random() * 1_000_000,
    priceUsd: 0.001 + Math.random() * 0.01,
    maker: `${"B".repeat(8)}${i}`.slice(0, 44),
  }));
}
