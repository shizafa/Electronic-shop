-- Electronic Shop — initial schema, derived from types/*.ts
-- Run once in the Supabase SQL editor (or via `supabase db push` if you set up the CLI later).

create extension if not exists pgcrypto;

-- ============================================================
-- Enums (mirror the TS unions in types/order.ts exactly)
-- ============================================================

create type order_status as enum (
  'order_placed',
  'processing',
  'ready_for_dispatch',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'return_requested',
  'returned_refunded'
);

create type payment_status as enum ('pending', 'paid', 'cod_pending', 'refunded', 'failed');

create type payment_method as enum ('cod', 'jazzcash', 'easypaisa', 'card', 'raast');

-- ============================================================
-- Users
-- ============================================================

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  label text not null,
  full_name text not null,
  phone text not null,
  city text not null,
  area text not null,
  address_line text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index addresses_user_id_idx on addresses (user_id);

-- ============================================================
-- Catalog
-- ============================================================

create table categories (
  id text primary key,
  slug text unique not null,
  name_key text not null,
  installation_required boolean not null default false
);

create table spec_fields (
  id text not null,
  category_id text not null references categories (id) on delete cascade,
  label_key text not null,
  unit text,
  type text not null check (type in ('text', 'number', 'boolean', 'enum')),
  options text[],
  filterable boolean not null default true,
  show_in_compare boolean not null default true,
  sort_order int not null default 0,
  primary key (category_id, id)
);

create table products (
  id text primary key,
  slug text unique not null,
  category_id text not null references categories (id),
  name text not null,
  brand text not null,
  description text not null,
  images text[] not null default '{}',
  specs jsonb not null default '{}',
  variant_axes jsonb not null default '[]',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_id_idx on products (category_id);

create table variants (
  id text primary key,
  product_id text not null references products (id) on delete cascade,
  sku text unique not null,
  axis_values jsonb not null default '{}',
  price numeric(12, 2) not null,
  compare_at_price numeric(12, 2),
  stock int not null default 0,
  images text[]
);

create index variants_product_id_idx on variants (product_id);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();

-- ============================================================
-- Cart / wishlist (compare intentionally stays client-side only)
-- ============================================================

create table cart_items (
  user_id uuid not null references profiles (id) on delete cascade,
  variant_id text not null references variants (id) on delete cascade,
  product_id text not null references products (id) on delete cascade,
  quantity int not null check (quantity > 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, variant_id)
);

create table wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  product_id text not null references products (id) on delete cascade,
  variant_id text references variants (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- variant_id is nullable (wishlisting doesn't require picking a variant), so the
-- uniqueness constraint can't just be a plain composite primary key.
create unique index wishlist_items_unique_idx
  on wishlist_items (user_id, product_id, coalesce(variant_id, ''));

-- ============================================================
-- Orders
-- ============================================================

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid not null references profiles (id),
  status order_status not null default 'order_placed',
  payment_status payment_status not null,
  payment_method payment_method not null,
  subtotal numeric(12, 2) not null,
  shipping_fee numeric(12, 2) not null default 0,
  total numeric(12, 2) not null,
  shipping_address jsonb not null,
  billing_address jsonb not null,
  installation jsonb,
  courier jsonb,
  placed_at timestamptz not null default now()
);

create index orders_user_id_idx on orders (user_id);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id text not null,
  variant_id text not null,
  product_name text not null,
  sku text not null,
  image text,
  unit_price numeric(12, 2) not null,
  quantity int not null,
  category_name text not null,
  installation_required boolean not null default false
);

create index order_items_order_id_idx on order_items (order_id);

create table order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  status order_status not null,
  changed_at timestamptz not null default now()
);

create index order_status_history_order_id_idx on order_status_history (order_id);

-- ============================================================
-- Helper: is_admin() — security definer to avoid RLS self-reference
-- issues when a policy on `profiles` itself needs to check admin status.
-- ============================================================

create or replace function is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select p.is_admin from profiles p where p.id = uid), false);
$$;

-- ============================================================
-- Trigger: create a profiles row automatically when a new auth user signs up.
-- name/phone come from the options.data passed to supabase.auth.signUp().
-- ============================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table addresses enable row level security;
alter table categories enable row level security;
alter table spec_fields enable row level security;
alter table products enable row level security;
alter table variants enable row level security;
alter table cart_items enable row level security;
alter table wishlist_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_status_history enable row level security;

-- profiles: user reads/updates own row; admins can read all
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_select_admin" on profiles for select using (is_admin(auth.uid()));
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
-- no insert policy needed: rows are created only by the handle_new_user trigger (security definer)

-- addresses: fully owner-scoped
create policy "addresses_all_own" on addresses for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- catalog: public read, admin write
create policy "categories_public_read" on categories for select using (true);
create policy "categories_admin_write" on categories for insert with check (is_admin(auth.uid()));
create policy "categories_admin_update" on categories for update using (is_admin(auth.uid()));
create policy "categories_admin_delete" on categories for delete using (is_admin(auth.uid()));

create policy "spec_fields_public_read" on spec_fields for select using (true);
create policy "spec_fields_admin_write" on spec_fields for insert with check (is_admin(auth.uid()));
create policy "spec_fields_admin_update" on spec_fields for update using (is_admin(auth.uid()));
create policy "spec_fields_admin_delete" on spec_fields for delete using (is_admin(auth.uid()));

create policy "products_public_read" on products for select using (true);
create policy "products_admin_write" on products for insert with check (is_admin(auth.uid()));
create policy "products_admin_update" on products for update using (is_admin(auth.uid()));
create policy "products_admin_delete" on products for delete using (is_admin(auth.uid()));

create policy "variants_public_read" on variants for select using (true);
create policy "variants_admin_write" on variants for insert with check (is_admin(auth.uid()));
create policy "variants_admin_update" on variants for update using (is_admin(auth.uid()));
create policy "variants_admin_delete" on variants for delete using (is_admin(auth.uid()));

-- cart / wishlist: fully owner-scoped
create policy "cart_items_all_own" on cart_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "wishlist_items_all_own" on wishlist_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- orders: owner can read/insert their own; admins can read/update all
create policy "orders_select_own" on orders for select using (auth.uid() = user_id);
create policy "orders_select_admin" on orders for select using (is_admin(auth.uid()));
create policy "orders_insert_own" on orders for insert with check (auth.uid() = user_id);
create policy "orders_update_admin" on orders for update using (is_admin(auth.uid()));

create policy "order_items_select_own" on order_items for select using (
  exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid())
);
create policy "order_items_select_admin" on order_items for select using (is_admin(auth.uid()));
create policy "order_items_insert_own" on order_items for insert with check (
  exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid())
);

create policy "order_status_history_select_own" on order_status_history for select using (
  exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid())
);
create policy "order_status_history_select_admin" on order_status_history for select using (is_admin(auth.uid()));
create policy "order_status_history_insert_own" on order_status_history for insert with check (
  exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid())
);
create policy "order_status_history_insert_admin" on order_status_history for insert with check (is_admin(auth.uid()));
