-- Two unrelated hardening fixes, bundled because both are one-liners:
--
-- 1. cart_items.updated_at (0001_init.sql) has never had a trigger — only products does
--    (products_set_updated_at). lib/cart.ts's updateCartQuantity does a plain
--    `.update({ quantity })` and its upsert calls don't set updated_at either, so the column
--    has been stuck at insert time since 0001. Reuses set_updated_at() from 0001_init.sql.
--
-- 2. reviews has no index with user_id as a leading column — only
--    reviews_product_status_idx (product_id, status) and the (product_id, user_id) unique
--    constraint, neither of which helps a lookup by user_id alone. lib/reviews.ts's
--    getReviewsForUser (powers /account/reviews) does `.eq("user_id", userId)` with nothing
--    to use.

create trigger cart_items_set_updated_at
  before update on cart_items
  for each row execute function set_updated_at();

create index reviews_user_id_idx on reviews (user_id);
