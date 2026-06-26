export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals?: number;
  imageUrl?: string;
  priceUsd: number;
  change24h: number;
  volume24h: number;
  marketCap?: number;
  liquidity?: number;
}

export interface TokenBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TokenHolder {
  address: string;
  balance: number;
  balanceUsd: number;
  pctHeld: number;
}

export interface LiveTrade {
  id: string;
  timestamp: number;
  type: "buy" | "sell";
  amountUsd: number;
  amountToken: number;
  priceUsd: number;
  maker: string;
}

export interface FeedTrade extends LiveTrade {
  tokenAddress: string;
  tokenSymbol: string;
}

export interface UserPosition {
  mint: string;
  symbol: string;
  balance: number;
  balanceUsd: number;
  avgEntry?: number;
  pnlUsd?: number;
  pnlPct?: number;
}
