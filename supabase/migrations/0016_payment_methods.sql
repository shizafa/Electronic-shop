-- Saved payment-method labels, powering /account/payment-methods. Deliberately stores only
-- non-sensitive display data — brand, last 4 digits, expiry, holder name — never a full card
-- number or CVC: there's no payment gateway in this app (checkout's card fields are cosmetic,
-- see components/checkout/payment-method.tsx's comment), so this stays a saved-card-label list,
-- not real payment processing. Shape mirrors `addresses` (0001_init.sql) — same
-- id/user_id/is_default/created_at columns, same owner-scoped "for all" RLS as
-- cart_items/wishlist_items. Run once in the Supabase SQL editor (or via `supabase db push`),
-- same as the earlier migrations.

create table payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  brand text not null check (brand in ('visa', 'mastercard')),
  holder text not null default '',
  last4 text not null check (last4 ~ '^[0-9]{4}$'),
  expiry text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index payment_methods_user_id_idx on payment_methods (user_id);

alter table payment_methods enable row level security;

create policy "payment_methods_all_own" on payment_methods for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
