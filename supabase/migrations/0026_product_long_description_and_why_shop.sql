-- Adds two admin-editable content pieces used by the product Description tab
-- (components/product/product-description-panel.tsx):
--   1. products.long_description: per-product body text, replaces the lorem-ipsum filler
--      paragraphs. Nullable, same optional-field shape as 0013's policy columns.
--   2. store_settings.why_shop_features: the "Why shop with us" 3-card row, same on every
--      product, so it belongs on the single settings row rather than per product. Stored as
--      jsonb (array of {icon, title, desc}) rather than fixed columns, matching the existing
--      products.specs / products.variant_axes jsonb convention — lets admin add/remove cards
--      without another migration. No RLS policy needed: store_settings already has public
--      select / admin-only update policies that cover any column on the row.

alter table products
  add column long_description text;

alter table store_settings
  add column why_shop_features jsonb not null default '[]';

update store_settings set why_shop_features = '[
  {"icon": "fa-regular fa-shield-check", "title": "Genuine Product", "desc": "100% authentic, sourced directly from authorized distributors."},
  {"icon": "fa-regular fa-truck", "title": "Free Shipping", "desc": "2–3 weeks free delivery nationwide on this item."},
  {"icon": "fa-regular fa-rotate-left", "title": "7 Days Return", "desc": "Free returns within 7 days of purchase."}
]'::jsonb
where id = 1;
