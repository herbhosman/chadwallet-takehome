-- Tighten RLS: trades and watchlist are written via server API (service role).

drop policy if exists "Allow watchlist read" on watchlist;
drop policy if exists "Allow watchlist write" on watchlist;
drop policy if exists "Allow watchlist delete" on watchlist;
drop policy if exists "Allow trades read" on trades;
drop policy if exists "Allow trades insert" on trades;

create policy "Block anon watchlist"
  on watchlist for all
  using (false)
  with check (false);

create policy "Block anon trades"
  on trades for all
  using (false)
  with check (false);
