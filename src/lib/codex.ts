import {
  CODEX_GRAPHQL_URL,
  SOLANA_NETWORK_ID,
} from "./constants";
import { MOCK_TRENDING } from "./mock-data";
import type { FeedTrade, LiveTrade, TokenBar, TokenHolder, TokenInfo } from "@/types/token";

interface CodexResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

const MIN_CHART_BARS = 10;

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
          decimals
          imageLargeUrl
          imageSmallUrl
        }
      }
    }
  }
`;

const SEARCH_TOKENS_QUERY = `
  query SearchTokens($network: [Int!]!, $phrase: String!, $limit: Int!) {
    filterTokens(
      filters: { network: $network }
      phrase: $phrase
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
          decimals
          imageLargeUrl
          imageSmallUrl
        }
      }
    }
  }
`;

const TOKEN_DECIMALS_QUERY = `
  query TokenDecimals($address: String!, $networkId: Int!) {
    token(input: { address: $address, networkId: $networkId }) {
      decimals
      symbol
      name
      info { imageLargeUrl imageSmallUrl }
    }
  }
`;

const TOKEN_BARS_QUERY = `
  query TokenBars($symbol: String!, $from: Int!, $to: Int!, $resolution: String!, $countback: Int) {
    getTokenBars(
      symbol: $symbol
      from: $from
      to: $to
      resolution: $resolution
      countback: $countback
      removeEmptyBars: true
    ) {
      o h l c t volume s
    }
  }
`;

const PAIR_BARS_QUERY = `
  query PairBars($symbol: String!, $from: Int!, $to: Int!, $resolution: String!, $countback: Int) {
    getBars(
      symbol: $symbol
      from: $from
      to: $to
      resolution: $resolution
      countback: $countback
      removeEmptyBars: true
    ) {
      o h l c t volume s
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
      enhancedToken0 { name symbol address imageLargeUrl imageSmallUrl }
      enhancedToken1 { name symbol address imageLargeUrl imageSmallUrl }
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

type BarsPayload = {
  o: number[];
  h: number[];
  l: number[];
  c: number[];
  t: number[];
  volume?: string[];
  s?: string;
};

function mapBars(bars: BarsPayload | null | undefined): TokenBar[] {
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

async function queryBars(
  query: string,
  symbol: string,
  from: number,
  to: number,
  resolution: string,
  countback = 120,
): Promise<TokenBar[]> {
  const data = await codexQuery<{ getTokenBars?: BarsPayload; getBars?: BarsPayload }>(
    query,
    { symbol, from, to, resolution, countback },
  );
  return mapBars(data?.getTokenBars ?? data?.getBars);
}

async function getPrimaryPairId(address: string): Promise<string | null> {
  const pairs = await codexQuery<{
    listPairsWithMetadataForToken: { results: { pair: { id: string } }[] };
  }>(LIST_PAIRS_QUERY, { tokenAddress: address, networkId: SOLANA_NETWORK_ID });
  return pairs?.listPairsWithMetadataForToken?.results?.[0]?.pair?.id ?? null;
}

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
    decimals?: number;
    imageLargeUrl?: string;
    imageSmallUrl?: string;
  };
}): TokenInfo | null {
  if (!r.token?.address) return null;
  return {
    address: r.token.address,
    name: r.token.name ?? "Unknown",
    symbol: r.token.symbol ?? "???",
    decimals: r.token.decimals,
    imageUrl: r.token.imageLargeUrl ?? r.token.imageSmallUrl,
    priceUsd: parseFloat(String(r.priceUSD ?? 0)),
    change24h: parseFloat(String(r.change24 ?? 0)),
    volume24h: parseFloat(String(r.volume24 ?? 0)),
    marketCap: r.marketCap ? parseFloat(String(r.marketCap)) : undefined,
    liquidity: r.liquidity ? parseFloat(String(r.liquidity)) : undefined,
  };
}

const SOLANA_ADDRESS_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export async function fetchTrendingTokens(limit = 20): Promise<TokenInfo[]> {
  const data = await codexQuery<{
    filterTokens: { results: Parameters<typeof mapTokenResult>[0][] };
  }>(FILTER_TOKENS_QUERY, { network: [SOLANA_NETWORK_ID], limit });

  const tokens = (data?.filterTokens?.results ?? [])
    .map(mapTokenResult)
    .filter((t): t is TokenInfo => t !== null);

  return tokens.length > 0 ? tokens : MOCK_TRENDING;
}

export async function searchTokens(
  phrase: string,
  limit = 25,
): Promise<TokenInfo[]> {
  const trimmed = phrase.trim();
  if (!trimmed) return [];

  if (SOLANA_ADDRESS_RE.test(trimmed)) {
    const byAddress =
      (await fetchTokenMetadata(trimmed)) ??
      (await fetchTokenDecimals(trimmed));
    return byAddress ? [byAddress] : [];
  }

  const data = await codexQuery<{
    filterTokens: { results: Parameters<typeof mapTokenResult>[0][] };
  }>(SEARCH_TOKENS_QUERY, {
    network: [SOLANA_NETWORK_ID],
    phrase: trimmed,
    limit,
  });

  return (data?.filterTokens?.results ?? [])
    .map(mapTokenResult)
    .filter((t): t is TokenInfo => t !== null);
}

export async function fetchTokenDecimals(address: string): Promise<TokenInfo | null> {
  const data = await codexQuery<{
    token: {
      decimals: number;
      symbol: string;
      name: string;
      info?: { imageLargeUrl?: string; imageSmallUrl?: string };
    };
  }>(TOKEN_DECIMALS_QUERY, { address, networkId: SOLANA_NETWORK_ID });

  const t = data?.token;
  if (!t) return null;

  return {
    address,
    name: t.name ?? "Unknown",
    symbol: t.symbol ?? address.slice(0, 4).toUpperCase(),
    decimals: t.decimals,
    imageUrl: t.info?.imageLargeUrl ?? t.info?.imageSmallUrl,
    priceUsd: 0,
    change24h: 0,
    volume24h: 0,
  };
}

export async function fetchTokenBars(
  address: string,
  resolution = "60",
  hoursBack = 168,
): Promise<TokenBar[]> {
  const now = Math.floor(Date.now() / 1000);
  const symbol = `${address}:${SOLANA_NETWORK_ID}`;

  const windows = [hoursBack, hoursBack * 4, 24 * 30];
  let best: TokenBar[] = [];

  for (const hours of windows) {
    const from = now - hours * 3600;
    let bars = await queryBars(TOKEN_BARS_QUERY, symbol, from, now, resolution, 120);
    if (bars.length < MIN_CHART_BARS) {
      const pairId = await getPrimaryPairId(address);
      if (pairId) {
        const pairBars = await queryBars(
          PAIR_BARS_QUERY,
          pairId,
          from,
          now,
          resolution,
          120,
        );
        if (pairBars.length > bars.length) bars = pairBars;
      }
    }
    if (bars.length > best.length) best = bars;
    if (best.length >= MIN_CHART_BARS) break;
  }

  return best;
}

export async function fetchTokenMetadata(address: string): Promise<TokenInfo | null> {
  const pairs = await codexQuery<{
    listPairsWithMetadataForToken: { results: { pair: { id: string } }[] };
  }>(LIST_PAIRS_QUERY, { tokenAddress: address, networkId: SOLANA_NETWORK_ID });

  const pairId = pairs?.listPairsWithMetadataForToken?.results?.[0]?.pair?.id;

  const [meta, decimalsInfo] = await Promise.all([
    pairId
      ? codexQuery<{
          pairMetadata: {
            price: string;
            liquidity: string;
            volume24: string;
            priceChange24: string;
            enhancedToken0: {
              name: string;
              symbol: string;
              address: string;
              imageLargeUrl?: string;
              imageSmallUrl?: string;
            };
            enhancedToken1: {
              name: string;
              symbol: string;
              address: string;
              imageLargeUrl?: string;
              imageSmallUrl?: string;
            };
          };
        }>(PAIR_METADATA_QUERY, { pairId })
      : null,
    fetchTokenDecimals(address),
  ]);

  const pm = meta?.pairMetadata;
  if (!pm) return decimalsInfo;

  const token =
    pm.enhancedToken0.address === address
      ? pm.enhancedToken0
      : pm.enhancedToken1;

  return {
    address,
    name: token.name,
    symbol: token.symbol,
    decimals: decimalsInfo?.decimals,
    imageUrl:
      token.imageLargeUrl ??
      token.imageSmallUrl ??
      decimalsInfo?.imageUrl,
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
      }[];
    };
  }>(HOLDERS_QUERY, { tokenId, limit });

  const items = data?.holders?.items ?? [];
  if (!items.length) return [];

  const totalBalance = items.reduce(
    (sum, h) => sum + parseFloat(h.balance),
    0,
  );

  return items.map((h) => {
    const balance = parseFloat(h.balance);
    return {
      address: h.address,
      balance,
      balanceUsd: parseFloat(h.balanceUsd),
      pctHeld: totalBalance > 0 ? (balance / totalBalance) * 100 : 0,
    };
  });
}

export async function fetchFeedTrades(limit = 30): Promise<FeedTrade[]> {
  const trending = await fetchTrendingTokens(8);
  if (!trending.length) return [];

  const batches = await Promise.all(
    trending.slice(0, 6).map(async (token) => {
      const trades = await fetchLiveTrades(token.address, 8);
      return trades.map((trade) => ({
        ...trade,
        tokenAddress: token.address,
        tokenSymbol: token.symbol,
      }));
    }),
  );

  return batches
    .flat()
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}
