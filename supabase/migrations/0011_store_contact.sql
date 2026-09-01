-- Adds contact/social columns to store_settings (0010_store_settings.sql). All nullable —
-- same optional-field shape as logo_url/favicon_url, no NOT NULL/seed needed since the row
-- already exists.

alter table store_settings
  add column email text,
  add column phone text,
  add column whatsapp text,
  add column address text,
  add column facebook_url text,
  add column instagram_url text,
  add column twitter_url text,
  add column youtube_url text;
