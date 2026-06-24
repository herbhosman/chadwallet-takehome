-- ChadWallet take-home: user watchlists and trade history

create table if not exists watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  token_mint text not null,
  created_at timestamptz default now(),
  unique (user_id, token_mint)
);

create table if not exists trades (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  wallet_address text not null,
  token_mint text not null,
  token_symbol text not null,
  side text not null check (side in ('buy', 'sell')),
  amount_usd numeric,
  tx_signature text,
  created_at timestamptz default now()
);

create index if not exists idx_watchlist_user on watchlist (user_id);
create index if not exists idx_trades_user on trades (user_id);
create index if not exists idx_trades_wallet on trades (wallet_address);

alter table watchlist enable row level security;
alter table trades enable row level security;

create policy "Users manage own watchlist"
  on watchlist for all
  using (auth.uid()::text = user_id or user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Users read own trades"
  on trades for select
  using (auth.uid()::text = user_id or user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Users insert own trades"
  on trades for insert
  with check (true);
