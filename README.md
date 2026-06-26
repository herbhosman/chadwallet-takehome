# ChadWallet Take-Home — Founding Engineer

fomo.family-style social crypto trading app for **Solana**, built with the ChadWallet tech stack.

## Live preview

Deploy to Vercel (see below), then share the URL with Pengcheng.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, Tailwind CSS |
| Auth | Privy (Google + Apple, embedded Solana wallet) |
| Market data | Codex.io GraphQL |
| RPC | Alchemy Solana |
| Swaps | Jupiter Swap API v2 |
| Charts | TradingView Lightweight Charts + Codex OHLCV |
| Database | Supabase (watchlist + trade log) |
| Edge | Cloudflare Worker (Codex proxy + cache) |
| Hosting | Vercel |

## Features

**Minimum**
- fomo-style dark UI with ChadWallet branding
- Google / Apple sign-in via Privy
- Solana embedded wallet
- Rotating token banners (top + bottom), clickable → trading page

**Bonus**
- 3-column trading page: trending | chart + holders + live trades | buy/sell + position
- Jupiter swaps (sign with Privy, execute via Jupiter)
- Real Codex data with mock fallbacks when keys are missing

## Quick start

```bash
cd chadwallet-takehome
cp .env.example .env.local
# Fill in API keys (see below)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo mode:** The app runs without API keys using mock trending data. Add keys for live data and trading.

## API keys

1. **Privy** — [dashboard.privy.io](https://dashboard.privy.io)
   - Create app → enable Google + Apple login
   - Enable Solana embedded wallets
   - Add `http://localhost:3000` and your Vercel URL to allowed origins
   - `NEXT_PUBLIC_PRIVY_APP_ID`

2. **Codex** — [dashboard.codex.io](https://dashboard.codex.io)
   - `CODEX_API_KEY`

3. **Alchemy** — [dashboard.alchemy.com](https://dashboard.alchemy.com)
   - Create Solana app → copy RPC URL
   - `NEXT_PUBLIC_SOLANA_RPC_URL`

4. **Jupiter** — [portal.jup.ag](https://portal.jup.ag)
   - `JUPITER_API_KEY`

5. **Supabase** (optional) — [supabase.com](https://supabase.com)
   - Run `supabase/migrations/001_initial.sql` in SQL editor
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

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

## Assets

Replace assets in `public/assets/chadwallet/` with updates from the [ChadWallet Drive folder](https://drive.google.com/drive/folders/1j4PZng-sJHxqAATUF1WYw1_jm8nyQwCE).

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
5. Trade logged to Supabase when configured

## Network

Default: **mainnet-beta**. Set `NEXT_PUBLIC_SOLANA_NETWORK=devnet` for devnet RPC (Jupiter liquidity is mainnet-first).
