# ChadWallet Take-Home — Founding Engineer

fomo.family-style social crypto trading app for **Solana mainnet**, built with the ChadWallet tech stack.

## Live preview

https://chadwallet-takehome-seven.vercel.app

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, Tailwind CSS |
| Auth | Privy (Google sign-in, embedded Solana wallet) |
| Market data | Codex.io GraphQL |
| RPC | Alchemy Solana (mainnet-beta) |
| Swaps | Jupiter Swap API v2 |
| Charts | TradingView Lightweight Charts + Codex OHLCV; TV Advanced Chart widget |
| Database | Supabase (watchlist + trade log via server API) |
| Edge | Cloudflare Worker (Codex proxy + cache) |
| Hosting | Vercel |

## Features

**Minimum**
- fomo-style dark UI with ChadWallet branding
- Google sign-in via Privy (Apple skipped per take-home guidance)
- Solana embedded wallet on **mainnet**
- Rotating token banners (top + bottom), clickable → trading page

**Bonus**
- 3-column trading page: trending | chart + holders + live trades | buy/sell + position
- Jupiter swaps (sign with Privy, execute via Jupiter)
- Real Codex data with mock fallbacks only when API keys are missing
- Codex phrase search, watchlist star, token images

## Quick start

```bash
cd chadwallet-takehome
cp .env.example .env.local
# Fill in API keys (see below)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo mode:** Runs without API keys using mock trending data. Add keys for live data and trading.

## API keys

1. **Privy** — [dashboard.privy.io](https://dashboard.privy.io)
   - Create app → enable **Google** login
   - Enable Solana embedded wallets
   - Add `http://localhost:3000` and your Vercel URL to allowed origins
   - `NEXT_PUBLIC_PRIVY_APP_ID`

2. **Codex** — [dashboard.codex.io](https://dashboard.codex.io)
   - `CODEX_API_KEY`

3. **Alchemy** — [dashboard.alchemy.com](https://dashboard.alchemy.com)
   - Create Solana app → copy full RPC URL
   - `NEXT_PUBLIC_SOLANA_RPC_URL`

4. **Jupiter** — [portal.jup.ag](https://portal.jup.ag)
   - `JUPITER_API_KEY`

5. **Supabase** — [supabase.com](https://supabase.com)
   - Run migrations in `supabase/migrations/` (001 + 002)
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server routes for trades/watchlist)

6. **Cloudflare Worker** (optional)
   ```bash
   cd cloudflare-worker
   npx wrangler secret put CODEX_API_KEY
   npx wrangler deploy
   ```
   - Set `NEXT_PUBLIC_CODEX_PROXY_URL` to worker URL

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add all env vars from `.env.example` in the Vercel project settings.

## Known limits

- **Holders tab** requires Codex plan upgrade; app shows an empty state instead of fake data.
- **Leaderboard traders** are demo rankings; token section is live Codex data.
- **TradingView Charting Library** (licensed product) is not used; Lightweight Charts + official widget instead.

## Project structure

```
src/app/           # Pages + API routes
src/components/    # UI (banners, trading, auth)
src/lib/           # Codex, Jupiter, Supabase clients
cloudflare-worker/ # Edge Codex proxy
supabase/          # DB migrations
```

## Trading flow

1. User signs in with Privy → embedded Solana wallet created
2. Buy/sell panel requests Jupiter `/order` quote via `/api/jupiter/quote`
3. User signs transaction with Privy (`useSignTransaction`)
4. Signed tx sent to Jupiter `/execute` via `/api/jupiter/execute`
5. Trade logged via `/api/trades` (service role) when Supabase is configured

## Network

**Mainnet-beta** by default. All Codex queries use Solana network ID `1399811149`. Jupiter swaps execute on mainnet.
