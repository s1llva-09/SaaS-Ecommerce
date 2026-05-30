-- ShopNow Supabase schema
-- Run this in Supabase SQL Editor before using the real data provider.
-- These policies allow the public anon key to write data for this demo/admin UI.
-- For production, replace them with authenticated/admin-only policies.

create table if not exists public.products (
  id text primary key,
  name text not null,
  category text,
  price numeric not null default 0,
  original_price numeric,
  image text,
  rating numeric default 0,
  reviews integer default 0,
  stock integer default 0,
  sku text,
  badge text,
  description text,
  colors jsonb not null default '[]'::jsonb,
  sizes jsonb not null default '[]'::jsonb,
  installments integer default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  customer text,
  email text,
  items jsonb not null default '[]'::jsonb,
  total numeric not null default 0,
  payment_method text,
  type text default 'delivery',
  status text default 'pending',
  date text,
  city text,
  channel text default 'Site',
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id text primary key,
  name text not null,
  email text,
  city text,
  total_orders integer default 0,
  total_spent numeric default 0,
  status text default 'active',
  join_date text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  name text primary key,
  icon text,
  image text,
  count integer default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.cashflow (
  id text primary key,
  type text not null default 'income',
  description text,
  category text,
  amount numeric not null default 0,
  date text,
  payment_method text,
  created_at timestamptz not null default now()
);

create table if not exists public.coupons (
  code text primary key,
  discount_type text not null default 'percentage',
  discount_value numeric not null default 0,
  expiry_date text,
  max_uses integer default 0,
  uses integer default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  id text primary key default 'default',
  geral jsonb not null default '{}'::jsonb,
  comercial jsonb not null default '{}'::jsonb,
  contato jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.promotions (
  id text primary key,
  product_id text not null,
  discount_percentage numeric not null default 0,
  start_date text,
  end_date text not null,
  active boolean default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.customers enable row level security;
alter table public.categories enable row level security;
alter table public.cashflow enable row level security;
alter table public.coupons enable row level security;
alter table public.promotions enable row level security;
alter table public.store_settings enable row level security;

drop policy if exists "shopnow public read products" on public.products;
drop policy if exists "shopnow public write products" on public.products;
drop policy if exists "shopnow public read orders" on public.orders;
drop policy if exists "shopnow public write orders" on public.orders;
drop policy if exists "shopnow public read customers" on public.customers;
drop policy if exists "shopnow public write customers" on public.customers;
drop policy if exists "shopnow public read categories" on public.categories;
drop policy if exists "shopnow public write categories" on public.categories;
drop policy if exists "shopnow public read cashflow" on public.cashflow;
drop policy if exists "shopnow public write cashflow" on public.cashflow;
drop policy if exists "shopnow public read coupons" on public.coupons;
drop policy if exists "shopnow public write coupons" on public.coupons;
drop policy if exists "shopnow public read promotions" on public.promotions;
drop policy if exists "shopnow public write promotions" on public.promotions;
drop policy if exists "shopnow public read store_settings" on public.store_settings;
drop policy if exists "shopnow public write store_settings" on public.store_settings;

create policy "shopnow public read products" on public.products for select using (true);
create policy "shopnow public write products" on public.products for all using (true) with check (true);

create policy "shopnow public read orders" on public.orders for select using (true);
create policy "shopnow public write orders" on public.orders for all using (true) with check (true);

create policy "shopnow public read customers" on public.customers for select using (true);
create policy "shopnow public write customers" on public.customers for all using (true) with check (true);

create policy "shopnow public read categories" on public.categories for select using (true);
create policy "shopnow public write categories" on public.categories for all using (true) with check (true);

create policy "shopnow public read cashflow" on public.cashflow for select using (true);
create policy "shopnow public write cashflow" on public.cashflow for all using (true) with check (true);

create policy "shopnow public read coupons" on public.coupons for select using (true);
create policy "shopnow public write coupons" on public.coupons for all using (true) with check (true);

create policy "shopnow public read promotions" on public.promotions for select using (true);
create policy "shopnow public write promotions" on public.promotions for all using (true) with check (true);

create policy "shopnow public read store_settings" on public.store_settings for select using (true);
create policy "shopnow public write store_settings" on public.store_settings for all using (true) with check (true);
