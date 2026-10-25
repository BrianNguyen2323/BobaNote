-- One row per logged drink. Paste this whole file into the Supabase SQL editor and run it once.

create table public.drink_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  drink_name text not null check (length(trim(drink_name)) > 0),
  date date not null,
  size text not null,
  sugar_percent smallint not null check (sugar_percent >= 0),
  ice_percent smallint not null check (ice_percent >= 0),
  toppings text[] not null default '{}',
  rating smallint check (rating between 1 and 10),
  shop_name text not null,
  shop_address text,
  shop_latitude double precision,
  shop_longitude double precision,
  shop_place_id text,
  created_at timestamptz not null default now()
);

create index drink_logs_user_id_date_idx on public.drink_logs (user_id, date desc);

-- Row level security: each signed-in user can see and change only their own rows.
alter table public.drink_logs enable row level security;

grant select, insert, update, delete on public.drink_logs to authenticated;

create policy "Users read their own drinks" on public.drink_logs
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Users add their own drinks" on public.drink_logs
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Users edit their own drinks" on public.drink_logs
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete their own drinks" on public.drink_logs
  for delete to authenticated using ((select auth.uid()) = user_id);
