-- Adds commerce config to store_settings (0010_store_settings.sql): currency, shipping, tax,
-- and whether Cash on Delivery is offered at checkout.
--
-- Defaults are chosen to match today's actual behavior exactly, so running this migration
-- changes nothing until an admin edits the Commerce tab:
--   - currency_code/currency_symbol default to 'PKR'/'Rs. ', the only values data/currencies.ts
--     has ever returned (see lib/currency.ts).
--   - shipping_flat_rate defaults to 0 — shipping has always been hardcoded free
--     (components/checkout/checkout-flow.tsx, lib/actions/orders.ts).
--   - tax_percent defaults to 0 — there has never been a tax line anywhere in this app.
--   - cod_enabled defaults to true — COD has always been offered (subject to the existing
--     $300,000 COD_MAX_ORDER_VALUE cap in components/checkout/payment-method.tsx, which this
--     step does not touch).

alter table store_settings
  add column currency_code text not null default 'PKR',
  add column currency_symbol text not null default 'Rs. ',
  add column shipping_flat_rate numeric(12, 2) not null default 0,
  add column free_shipping_threshold numeric(12, 2),
  add column tax_percent numeric(5, 2) not null default 0,
  add column cod_enabled boolean not null default true;

-- Orders don't currently have anywhere to record tax. tax_percent can change after an order is
-- placed, so — same reasoning as subtotal/shipping_fee already being snapshotted per order
-- rather than recomputed later — the tax actually charged needs its own column too, not just a
-- derived total - subtotal - shipping_fee.
alter table orders add column tax_amount numeric(12, 2) not null default 0;
