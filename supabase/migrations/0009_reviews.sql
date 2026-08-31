-- Product reviews, pending admin approval before they're public. Run once in the Supabase
-- SQL editor (or via `supabase db push`), same as the earlier migrations.
--
-- Two deliberate deviations from a literal customer_id/no-admin-select spec:
--   - user_id, not customer_id — matches every other owner-scoped table (orders, addresses,
--     cart_items, wishlist_items).
--   - reviews_select_admin is added even though it wasn't explicitly requested: without it,
--     nothing in /admin/reviews (or the sidebar's pending-count badge) could read pending/
--     rejected rows at all, since RLS would filter them out even for an admin's own session.

create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references products (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  title text not null,
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  is_verified_purchase boolean not null default false,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (product_id, user_id)
);

create index reviews_product_status_idx on reviews (product_id, status);

alter table reviews enable row level security;

create policy "reviews_select_public" on reviews for select using (status = 'approved');
create policy "reviews_select_admin" on reviews for select using (is_admin(auth.uid()));
create policy "reviews_insert_own" on reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update_admin" on reviews for update using (is_admin(auth.uid()));

-- ============================================================
-- Denormalized rating aggregate on products, kept in sync by a trigger — chosen over a view
-- because PRODUCT_SELECT in lib/products.ts already does `select *` on products in all 5 of
-- its query functions, so these columns reach ProductCard/ProductDetail with zero query
-- changes. A view would need every one of those functions rewritten to join it in.
-- ============================================================

alter table products add column average_rating numeric(2, 1) not null default 0;
alter table products add column review_count int not null default 0;

create or replace function update_product_rating(target_product_id text)
returns void
language plpgsql
as $$
begin
  update products
    set average_rating = coalesce(
          (select round(avg(rating)::numeric, 1) from reviews where product_id = target_product_id and status = 'approved'),
          0
        ),
        review_count = (select count(*) from reviews where product_id = target_product_id and status = 'approved')
    where id = target_product_id;
end;
$$;

-- Recomputes whichever product_id(s) the write actually affects — both old and new on an
-- UPDATE that reassigns product_id, which never happens in this app's own code but keeps the
-- trigger correct regardless of how a row gets written.
create or replace function reviews_recompute_product_rating()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform update_product_rating(old.product_id);
  elsif tg_op = 'UPDATE' and old.product_id is distinct from new.product_id then
    perform update_product_rating(old.product_id);
    perform update_product_rating(new.product_id);
  else
    perform update_product_rating(new.product_id);
  end if;
  return null;
end;
$$;

create trigger reviews_recompute_rating
  after insert or update or delete on reviews
  for each row execute function reviews_recompute_product_rating();
