-- Store-wide branding settings (name, tagline, logo, favicon), single row. Same
-- single-row-table shape as 0002_admin_settings.sql's sales_targets. Run once in the
-- Supabase SQL editor (or via `supabase db push`).

create table store_settings (
  id smallint primary key default 1 check (id = 1), -- enforce a single settings row
  store_name text not null,
  tagline text,
  logo_url text,
  favicon_url text,
  updated_at timestamptz not null default now()
);

insert into store_settings (id, store_name, tagline) values (1, 'Electronics', 'Consumer electronics and home appliances, delivered across Pakistan.');

alter table store_settings enable row level security;

-- public read (storefront header/footer/metadata need this with no auth), admin-only write
create policy "store_settings_public_read" on store_settings for select using (true);
create policy "store_settings_admin_update" on store_settings for update using (is_admin(auth.uid()));

-- Storage bucket for the logo/favicon uploads, same shape as 0003/0005's image buckets.
insert into storage.buckets (id, name, public)
values ('store-assets', 'store-assets', true)
on conflict (id) do nothing;

create policy "store_assets_public_read" on storage.objects
  for select using (bucket_id = 'store-assets');

create policy "store_assets_admin_insert" on storage.objects
  for insert with check (bucket_id = 'store-assets' and is_admin(auth.uid()));

create policy "store_assets_admin_update" on storage.objects
  for update using (bucket_id = 'store-assets' and is_admin(auth.uid()));

create policy "store_assets_admin_delete" on storage.objects
  for delete using (bucket_id = 'store-assets' and is_admin(auth.uid()));
