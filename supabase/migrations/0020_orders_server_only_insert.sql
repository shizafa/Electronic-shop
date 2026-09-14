-- Orders can only be created server-side. Run once in the Supabase SQL editor (or via
-- `supabase db push`), same as the earlier migrations.
--
-- The *_insert_own policies (0001_init.sql) let any signed-in customer insert rows into orders /
-- order_items / order_status_history straight from the browser with the public anon key — with
-- whatever payment_status and prices they like. Now that card payments are real (0019), that
-- means a customer could create an order marked 'paid' without paying. lib/actions/orders.ts's
-- placeOrder (the only customer-facing writer) now inserts all three with the service-role
-- client instead, after recomputing prices and charging the card, so customers need no insert
-- grant at all.
--
-- Deliberately kept: order_status_history_insert_admin — lib/actions/admin/orders.ts's
-- updateOrderStatus records status changes under the admin's own session and relies on it.
-- The select policies are unchanged, so customers still read their own orders as before.

drop policy "orders_insert_own" on orders;
drop policy "order_items_insert_own" on order_items;
drop policy "order_status_history_insert_own" on order_status_history;
