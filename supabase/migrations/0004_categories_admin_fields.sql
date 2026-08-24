-- Extends categories with the fields needed to fully manage them from the admin dashboard
-- (plain-text name, imagery, description, visibility, ordering) instead of the original
-- build-time-only set of 3 hardcoded categories keyed off a static i18n dictionary. Run once
-- in the Supabase SQL editor (or via `supabase db push`), same as the earlier migrations.

alter table categories
  add column name text,
  add column description text not null default '',
  add column thumbnail_url text,
  add column banner_url text,
  add column is_active boolean not null default true,
  add column display_order int not null default 0;

-- Backfill the 3 originally-seeded categories' plain names from their old i18n keys, then fall
-- back to the raw key text for anything else already in the table.
update categories set name = 'Air Conditioners' where id = 'air-conditioners' and name is null;
update categories set name = 'Televisions' where id = 'televisions' and name is null;
update categories set name = 'Mobile Phones' where id = 'mobile-phones' and name is null;
update categories set name = name_key where name is null;

alter table categories alter column name set not null;
alter table categories drop column name_key;
