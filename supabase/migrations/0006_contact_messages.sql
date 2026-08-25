-- Backs the storefront contact form (previously a mock with no backend) and the admin
-- Messages inbox. Public insert (the contact page isn't login-gated — anyone can submit),
-- admin-only read/update/delete. Run once in the Supabase SQL editor (or via `supabase db
-- push`), same as the earlier migrations.

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'handled')),
  created_at timestamptz not null default now()
);

create index contact_messages_status_idx on contact_messages (status);

alter table contact_messages enable row level security;

create policy "contact_messages_public_insert" on contact_messages for insert with check (true);
create policy "contact_messages_admin_select" on contact_messages for select using (is_admin(auth.uid()));
create policy "contact_messages_admin_update" on contact_messages for update using (is_admin(auth.uid()));
create policy "contact_messages_admin_delete" on contact_messages for delete using (is_admin(auth.uid()));
