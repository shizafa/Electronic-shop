-- Adds policy text columns to store_settings (0010_store_settings.sql). All nullable, same
-- optional-field shape as email/phone/etc. in 0011_store_contact.sql — no NOT NULL/seed
-- needed since the row already exists. Content is admin-authored Markdown, rendered on the
-- storefront; an empty field means the storefront route 404s instead of showing a blank page.

alter table store_settings
  add column shipping_policy text,
  add column return_policy text,
  add column privacy_policy text,
  add column terms text;
