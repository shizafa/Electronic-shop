-- Per-user notification preferences, powering /account/notifications. One row per user
-- (primary key = user_id, same 1:1-table shape as cart_items/wishlist_items' owner-scoped "for
-- all" policy), created on first save via upsert (lib/actions/notifications.ts) — a signed-in
-- user with no row yet just sees the client-side defaults in lib/notifications.ts. Run once in
-- the Supabase SQL editor (or via `supabase db push`), same as the earlier migrations.

create table notification_preferences (
  user_id uuid primary key references profiles (id) on delete cascade,
  order_updates boolean not null default true,
  promotions boolean not null default true,
  newsletter boolean not null default false,
  sms_alerts boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table notification_preferences enable row level security;

create policy "notification_preferences_all_own" on notification_preferences for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
