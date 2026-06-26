/**
 * Cloudflare Worker — Codex GraphQL proxy with edge caching.
 *
 * Deploy:
 *   cd cloudflare-worker && npx wrangler deploy
 *
 * Set CODEX_API_KEY in Cloudflare dashboard secrets.
 * Point NEXT_PUBLIC_CODEX_PROXY_URL to the worker URL.
 */

export interface Env {
  CODEX_API_KEY: string;
}

const CODEX_URL = "https://graph.codex.io/graphql";
const CACHE_TTL = 30;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(),
      });
    }

    if (request.method === "GET") {
      return withCors(
        new Response(
          JSON.stringify({ ok: true, service: "chadwallet-codex-proxy" }),
          { headers: { "Content-Type": "application/json" } },
        ),
      );
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const cache = caches.default;
    const cacheKey = new Request(request.url + (await request.clone().text()), {
      method: "GET",
    });

    const cached = await cache.match(cacheKey);
    if (cached) {
      return withCors(cached);
    }

    const body = await request.text();

    const upstream = await fetch(CODEX_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: env.CODEX_API_KEY,
      },
      body,
    });

    const response = new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${CACHE_TTL}`,
      },
    });

    await cache.put(cacheKey, response.clone());
    return withCors(response);
  },
};

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders()).forEach(([k, v]) => headers.set(k, v));
  return new Response(response.body, { status: response.status, headers });
}
