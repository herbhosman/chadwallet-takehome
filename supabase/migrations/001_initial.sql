-- ChadWallet take-home: user watchlists and trade history
-- Auth is via Privy (user_id = Privy DID), not Supabase Auth.

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

-- Take-home: app uses anon key + Privy user_id strings (no Supabase Auth session).
create policy "Allow watchlist read"
  on watchlist for select using (true);

create policy "Allow watchlist write"
  on watchlist for insert with check (true);

create policy "Allow watchlist delete"
  on watchlist for delete using (true);

create policy "Allow trades read"
  on trades for select using (true);

create policy "Allow trades insert"
  on trades for insert with check (true);
