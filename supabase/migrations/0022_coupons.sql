-- Discount coupons. Run once in the Supabase SQL editor (or via `supabase db push`), same as the
-- earlier migrations.
--
-- Admins manage coupons at /admin/coupons (lib/actions/admin/coupons.ts). Customers never read
-- this table directly — no public select policy, so codes can't be listed from the browser. The
-- checkout validates a typed code through a Server Action (lib/actions/coupons.ts) and
-- lib/actions/orders.ts's placeOrder re-validates and redeems it with the service-role client.

create type coupon_type as enum ('percent', 'flat');

create table coupons (
  id uuid primary key default gen_random_uuid(),
  -- Stored upper-case so lookups are a plain equality match on what the customer typed (upper-cased).
  code text not null unique check (code = upper(code) and code ~ '^[A-Z0-9_-]{3,32}$'),
  type coupon_type not null,
  value numeric(12, 2) not null check (value > 0),
  -- null = unlimited. used_count can end up above usage_limit only if an admin lowers the limit
  -- after the fact, which simply leaves the coupon exhausted.
  usage_limit int check (usage_limit is null or usage_limit > 0),
  used_count int not null default 0 check (used_count >= 0),
  -- null = never expires. The admin form picks a date; it's stored as the end of that day,
  -- Pakistan time (lib/coupon-dates.ts).
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint coupons_percent_max check (type <> 'percent' or value <= 100)
);

alter table coupons enable row level security;

create policy "coupons_admin_all" on coupons for all
  using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

-- Order snapshot. coupon_code is copied (not just referenced) so the order keeps reading right
-- even if the coupon is later edited; discount_amount is what was actually taken off, same
-- reasoning as tax_amount in 0012_store_commerce.sql.
alter table orders
  add column coupon_id uuid references coupons (id) on delete set null,
  add column coupon_code text,
  add column discount_amount numeric(12, 2) not null default 0;

-- ============================================================
-- Atomic redemption for placeOrder. Re-checks active/expiry/limit inside the UPDATE itself, so
-- two checkouts racing for a coupon's last use can't both succeed (the row lock serialises them
-- and the second one re-evaluates `used_count < usage_limit` after the first commits). Returns
-- true only if a use was actually reserved.
--
-- Same security model as decrement_variant_stock (0008): security definer, execute locked to
-- service_role so a logged-in client can't call supabase.rpc(...) to burn through a coupon's uses.
-- ============================================================

create or replace function redeem_coupon(p_coupon_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_rows int;
begin
  update coupons
     set used_count = used_count + 1
   where id = p_coupon_id
     and is_active
     and (expires_at is null or expires_at > now())
     and (usage_limit is null or used_count < usage_limit);

  get diagnostics updated_rows = row_count;
  return updated_rows > 0;
end;
$$;

revoke all on function redeem_coupon(uuid) from public, anon, authenticated;
grant execute on function redeem_coupon(uuid) to service_role;

-- Gives a reserved use back: placeOrder calls it when the order couldn't be created after the
-- coupon was redeemed, and fail_card_order (below) when a card payment fails or is cancelled.
create or replace function release_coupon(p_coupon_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update coupons set used_count = used_count - 1 where id = p_coupon_id and used_count > 0;
end;
$$;

revoke all on function release_coupon(uuid) from public, anon, authenticated;
grant execute on function release_coupon(uuid) to service_role;

-- ============================================================
-- fail_card_order (0021_fail_card_order.sql), unchanged apart from also releasing the order's
-- coupon use. It's inside the same transaction and behind the same pending guard, so a failed
-- card order gives its coupon use back exactly once, however many callers report the failure.
-- ============================================================

create or replace function fail_card_order(p_order_id uuid, p_payment_intent_id text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_rows int;
  v_coupon_id uuid;
begin
  update orders
     set payment_status = 'failed',
         status = 'cancelled',
         stripe_payment_intent_id = coalesce(p_payment_intent_id, stripe_payment_intent_id)
   where id = p_order_id
     and payment_method = 'card'
     and payment_status = 'pending'
  returning coupon_id into v_coupon_id;

  get diagnostics updated_rows = row_count;
  if updated_rows = 0 then
    return false; -- already settled by an earlier caller
  end if;

  perform increment_variant_stock(
    coalesce(
      (select jsonb_agg(jsonb_build_object('variant_id', variant_id, 'quantity', quantity))
         from order_items
        where order_id = p_order_id),
      '[]'::jsonb
    )
  );

  if v_coupon_id is not null then
    perform release_coupon(v_coupon_id);
  end if;

  insert into order_status_history (order_id, status) values (p_order_id, 'cancelled');

  return true;
end;
$$;

revoke all on function fail_card_order(uuid, text) from public, anon, authenticated;
grant execute on function fail_card_order(uuid, text) to service_role;
