-- Stripe card payments (embedded Payment Element). Run once in the Supabase SQL editor (or via
-- `supabase db push`), same as the earlier migrations.
--
-- A card order is inserted as payment_status 'pending' before its PaymentIntent is confirmed
-- (lib/actions/orders.ts's placeOrder), then flipped to 'paid' or 'failed' by lib/stripe-orders.ts
-- — from placeOrder itself, the 3-D Secure follow-up, or the webhook at app/api/stripe/webhook.

-- Links an order to its Stripe PaymentIntent (pi_...). Unique so one payment can never be
-- attached to two orders; null for COD and every pre-Stripe order.
alter table orders add column stripe_payment_intent_id text unique;

-- ============================================================
-- Stock give-back for a card order whose payment failed or was cancelled — the inverse of
-- decrement_variant_stock (0008_variant_low_stock_threshold.sql), which placeOrder already ran
-- when the order was created. Same security model: security definer because customers have no
-- RLS update grant on variants, and execute locked to service_role so a logged-in client can't
-- call supabase.rpc(...) directly to inflate stock. lib/stripe-orders.ts calls it via
-- lib/supabase/admin.ts's service-role client, and only after its conditional
-- `payment_status = 'pending'` update actually matched a row — so a webhook and the action
-- racing on the same order can't restock it twice.
-- ============================================================

create or replace function increment_variant_stock(items jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
begin
  for item in select * from jsonb_to_recordset(items) as x(variant_id text, quantity int)
  loop
    update variants set stock = stock + item.quantity where id = item.variant_id;
  end loop;
end;
$$;

revoke all on function increment_variant_stock(jsonb) from public, anon, authenticated;
grant execute on function increment_variant_stock(jsonb) to service_role;
