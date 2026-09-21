-- Adds the intro paragraph shown between the "Why shop with us" heading and its card row
-- (components/product/product-description-panel.tsx). Nullable, same optional-field shape as
-- 0013's policy columns — an empty value just means the paragraph doesn't render.

alter table store_settings
  add column why_shop_intro text;
