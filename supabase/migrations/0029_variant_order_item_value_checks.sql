-- Non-negative/positive checks that were missing on money and quantity columns since
-- 0001_init.sql. cart_items.quantity already had `check (quantity > 0)` — everything else
-- below had no floor at all, so a bad write (admin form bug, direct SQL, a bug in
-- lib/actions/admin/products.ts) could leave a negative price, a negative stock count, or a
-- zero-quantity order line with nothing to catch it.
--
-- Adding a check constraint scans existing rows for violations, so this will fail loudly if
-- any current data already breaks these — that's intentional; fix the data first rather than
-- weakening the constraint.

alter table variants
  add constraint variants_price_nonnegative check (price >= 0),
  add constraint variants_compare_at_price_nonnegative check (compare_at_price is null or compare_at_price >= 0),
  add constraint variants_stock_nonnegative check (stock >= 0);

alter table order_items
  add constraint order_items_unit_price_nonnegative check (unit_price >= 0),
  add constraint order_items_quantity_positive check (quantity > 0);
