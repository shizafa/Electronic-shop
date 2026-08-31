-- Adds a per-variant low-stock threshold, additive to the stock tracking that already exists
-- (variants.stock, from 0001_init.sql). No products.stock_quantity — a product's stock status
-- is derived from its variants (lib/product-helpers.ts), never stored separately, so it can't
-- drift out of sync with the numbers cart/PDP/admin already read.

alter table variants add column low_stock_threshold int not null default 5;

-- ============================================================
-- Atomic stock decrement for order placement — see decrement_variant_stock's use in
-- lib/actions/orders.ts's placeOrder. security definer because customers have no RLS
-- update grant on variants (only variants_admin_update does); execute is then locked to
-- service_role only, since a security-definer function reachable by `authenticated` would
-- let any logged-in client call it directly (supabase.rpc(...) from the browser) to drain
-- another product's stock for free — nothing here ties a decrement to a real paid order.
-- placeOrder therefore calls this via lib/supabase/admin.ts's service-role client, not the
-- caller's own cookie-bound session client.
-- ============================================================

create or replace function decrement_variant_stock(items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
  updated_rows int;
begin
  for item in select * from jsonb_to_recordset(items) as x(variant_id text, quantity int)
  loop
    update variants set stock = stock - item.quantity
      where id = item.variant_id and stock >= item.quantity;

    get diagnostics updated_rows = row_count;
    if updated_rows = 0 then
      raise exception 'Insufficient stock for variant %', item.variant_id;
    end if;
  end loop;
end;
$$;

revoke all on function decrement_variant_stock(jsonb) from public, anon, authenticated;
grant execute on function decrement_variant_stock(jsonb) to service_role;



