import {
  CODEX_GRAPHQL_URL,
  SOLANA_NETWORK_ID,
} from "./constants";
import { MOCK_TRENDING } from "./mock-data";
import type { LiveTrade, TokenBar, TokenHolder, TokenInfo } from "@/types/token";

interface CodexResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

async function codexQuery<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T | null> {
  const isServer = typeof window === "undefined";
  const apiKey = process.env.CODEX_API_KEY;

  let url: string;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (isServer && apiKey) {
    url = CODEX_GRAPHQL_URL;
    headers.Authorization = apiKey;
  } else if (isServer) {
    return null;
  } else {
    const proxyUrl = process.env.NEXT_PUBLIC_CODEX_PROXY_URL;
    url = proxyUrl ? proxyUrl : "/api/codex";
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    ...(isServer ? { next: { revalidate: 30 } } : {}),
  });

  if (!res.ok) return null;
  const json = (await res.json()) as CodexResponse<T>;
  if (json.errors?.length) {
    console.error("Codex errors:", json.errors);
    return null;
  }
  return json.data ?? null;
}

const FILTER_TOKENS_QUERY = `
  query FilterTrending($network: [Int!]!, $limit: Int!) {
    filterTokens(
      filters: { network: $network }
      rankings: [{ attribute: volume24, direction: DESC }]
      limit: $limit
    ) {
      results {
        priceUSD
        change24
        volume24
        marketCap
        liquidity
        token {
          address
          name
          symbol
          imageLargeUrl
          imageSmallUrl
        }
      }
    }
  }
`;

const TOKEN_BARS_QUERY = `
  query TokenBars($symbol: String!, $from: Int!, $to: Int!, $resolution: String!) {
    getTokenBars(symbol: $symbol, from: $from, to: $to, resolution: $resolution) {
      o h l c t volume
    }
  }
`;

const PAIR_METADATA_QUERY = `
  query PairMeta($pairId: String!) {
    pairMetadata(pairId: $pairId) {
      price
      liquidity
      volume24
      priceChange24
      enhancedToken0 { name symbol address }
      enhancedToken1 { name symbol address }
    }
  }
`;

const TOKEN_EVENTS_QUERY = `
  query TokenEvents($address: String!, $networkId: Int!, $limit: Int!) {
    getTokenEvents(
      query: { address: $address, networkId: $networkId, eventType: Swap }
      limit: $limit
      direction: DESC
    ) {
      items {
        id
        timestamp
        eventType
        maker
        data {
          ... on SwapEventData {
            priceUsdTotal
            amount0
            amount1
            priceUsd
          }
        }
      }
    }
  }
`;

const HOLDERS_QUERY = `
  query TokenHolders($tokenId: String!, $limit: Int!) {
    holders(input: { tokenId: $tokenId, limit: $limit }) {
      items {
        address
        balance
        balanceUsd
        percentage
      }
    }
  }
`;

const LIST_PAIRS_QUERY = `
  query ListPairs($tokenAddress: String!, $networkId: Int!) {
    listPairsWithMetadataForToken(
      tokenAddress: $tokenAddress
      networkId: $networkId
      limit: 1
    ) {
      results {
        pair { id }
      }
    }
  }
`;

function mapTokenResult(r: {
  priceUSD?: string | number;
  change24?: string | number;
  volume24?: string | number;
  marketCap?: string | number;
  liquidity?: string | number;
  token?: {
    address: string;
    name: string;
    symbol: string;
    imageLargeUrl?: string;
    imageSmallUrl?: string;
  };
}): TokenInfo | null {
  if (!r.token?.address) return null;
  return {
    address: r.token.address,
    name: r.token.name ?? "Unknown",
    symbol: r.token.symbol ?? "???",
    imageUrl: r.token.imageLargeUrl ?? r.token.imageSmallUrl,
    priceUsd: parseFloat(String(r.priceUSD ?? 0)),
    change24h: parseFloat(String(r.change24 ?? 0)),
    volume24h: parseFloat(String(r.volume24 ?? 0)),
    marketCap: r.marketCap ? parseFloat(String(r.marketCap)) : undefined,
    liquidity: r.liquidity ? parseFloat(String(r.liquidity)) : undefined,
  };
}

export async function fetchTrendingTokens(limit = 20): Promise<TokenInfo[]> {
  const data = await codexQuery<{
    filterTokens: { results: Parameters<typeof mapTokenResult>[0][] };
  }>(FILTER_TOKENS_QUERY, { network: [SOLANA_NETWORK_ID], limit });

  const tokens = (data?.filterTokens?.results ?? [])
    .map(mapTokenResult)
    .filter((t): t is TokenInfo => t !== null);

  return tokens.length > 0 ? tokens : MOCK_TRENDING;
}

export async function fetchTokenBars(
  address: string,
  resolution = "60",
  hoursBack = 48,
): Promise<TokenBar[]> {
  const now = Math.floor(Date.now() / 1000);
  const from = now - hoursBack * 3600;
  const symbol = `${address}:${SOLANA_NETWORK_ID}`;

  const data = await codexQuery<{
    getTokenBars: {
      o: number[];
      h: number[];
      l: number[];
      c: number[];
      t: number[];
      volume?: string[];
    };
  }>(TOKEN_BARS_QUERY, { symbol, from, to: now, resolution });

  const bars = data?.getTokenBars;
  if (!bars?.t?.length) return [];

  return bars.t.map((time, i) => ({
    time,
    open: bars.o[i] ?? 0,
    high: bars.h[i] ?? 0,
    low: bars.l[i] ?? 0,
    close: bars.c[i] ?? 0,
    volume: parseFloat(bars.volume?.[i] ?? "0"),
  }));
}

export async function fetchTokenMetadata(address: string): Promise<TokenInfo | null> {
  const pairs = await codexQuery<{
    listPairsWithMetadataForToken: { results: { pair: { id: string } }[] };
  }>(LIST_PAIRS_QUERY, { tokenAddress: address, networkId: SOLANA_NETWORK_ID });

  const pairId = pairs?.listPairsWithMetadataForToken?.results?.[0]?.pair?.id;
  if (!pairId) return null;

  const meta = await codexQuery<{
    pairMetadata: {
      price: string;
      liquidity: string;
      volume24: string;
      priceChange24: string;
      enhancedToken0: { name: string; symbol: string; address: string };
      enhancedToken1: { name: string; symbol: string; address: string };
    };
  }>(PAIR_METADATA_QUERY, { pairId });

  const pm = meta?.pairMetadata;
  if (!pm) return null;

  const token =
    pm.enhancedToken0.address === address
      ? pm.enhancedToken0
      : pm.enhancedToken1;

  return {
    address,
    name: token.name,
    symbol: token.symbol,
    priceUsd: parseFloat(pm.price),
    change24h: parseFloat(pm.priceChange24),
    volume24h: parseFloat(pm.volume24),
    liquidity: parseFloat(pm.liquidity),
  };
}

export async function fetchLiveTrades(
  address: string,
  limit = 25,
): Promise<LiveTrade[]> {
  const data = await codexQuery<{
    getTokenEvents: {
      items: {
        id: string;
        timestamp: number;
        maker: string;
        data: {
          priceUsdTotal?: string;
          amount0?: string;
          amount1?: string;
          priceUsd?: string;
        };
      }[];
    };
  }>(TOKEN_EVENTS_QUERY, { address, networkId: SOLANA_NETWORK_ID, limit });

  return (data?.getTokenEvents?.items ?? []).map((item) => ({
    id: item.id,
    timestamp: item.timestamp * 1000,
    type: parseFloat(item.data.amount0 ?? "0") > 0 ? "buy" : "sell",
    amountUsd: parseFloat(item.data.priceUsdTotal ?? "0"),
    amountToken: Math.abs(parseFloat(item.data.amount0 ?? item.data.amount1 ?? "0")),
    priceUsd: parseFloat(item.data.priceUsd ?? "0"),
    maker: item.maker,
  }));
}

export async function fetchHolders(
  address: string,
  limit = 15,
): Promise<TokenHolder[]> {
  const tokenId = `${address}:${SOLANA_NETWORK_ID}`;
  const data = await codexQuery<{
    holders: {
      items: {
        address: string;
        balance: string;
        balanceUsd: string;
        percentage: string;
      }[];
    };
  }>(HOLDERS_QUERY, { tokenId, limit });

  return (data?.holders?.items ?? []).map((h) => ({
    address: h.address,
    balance: parseFloat(h.balance),
    balanceUsd: parseFloat(h.balanceUsd),
    pctHeld: parseFloat(h.percentage),
  }));
}
