-- Admin dashboard settings — currently just the weekly/monthly sales target shown on
-- the Overview page's target gauge. Run once in the Supabase SQL editor (or via
-- `supabase db push` if the CLI is set up), same as 0001_init.sql.

create table sales_targets (
  id smallint primary key default 1 check (id = 1), -- enforce a single settings row
  weekly_target numeric(12, 2) not null default 0,
  monthly_target numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now()
);

insert into sales_targets (id) values (1);

alter table sales_targets enable row level security;

create policy "sales_targets_admin_all" on sales_targets
  for all using (is_admin(auth.uid())) with check (is_admin(auth.uid()));
