-- Atomic failure path for card orders. Run once in the Supabase SQL editor (or via
-- `supabase db push`), same as the earlier migrations.
--
-- lib/stripe-orders.ts's failCardOrder used to make three separate calls: mark the order failed,
-- restock via increment_variant_stock (0019_orders_stripe.sql), insert the status history row.
-- If a call after the first one failed, the order was already 'failed', so every retry (webhook or
-- cancelCardOrder) matched no pending row and stopped — the stock was never given back. This does
-- all three in one transaction: any error rolls the whole thing back and the order stays
-- 'pending' for the next caller to retry.
--
-- Same pending guard as before, so it stays idempotent: under concurrent calls the second one
-- blocks on the row lock, re-checks payment_status = 'pending' after the first commits, matches
-- nothing and returns false without restocking. Returns true only for the call that actually
-- failed the order.
--
-- Same security model as increment_variant_stock: security definer, execute locked to
-- service_role (called via lib/supabase/admin.ts's service-role client).

create or replace function fail_card_order(p_order_id uuid, p_payment_intent_id text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_rows int;
begin
  update orders
     set payment_status = 'failed',
         status = 'cancelled',
         stripe_payment_intent_id = coalesce(p_payment_intent_id, stripe_payment_intent_id)
   where id = p_order_id
     and payment_method = 'card'
     and payment_status = 'pending';

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

  insert into order_status_history (order_id, status) values (p_order_id, 'cancelled');

  return true;
end;
$$;

revoke all on function fail_card_order(uuid, text) from public, anon, authenticated;
grant execute on function fail_card_order(uuid, text) to service_role;
