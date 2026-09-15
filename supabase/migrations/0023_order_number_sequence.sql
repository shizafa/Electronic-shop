-- Sequential order numbers: ORD-{year}-{000001}. Run once in the Supabase SQL editor (or via
-- `supabase db push`), same as the earlier migrations.
--
-- placeOrder (lib/actions/orders.ts) used to pick ORD-{year}-{random 1000–9999} in JS. With
-- order_number unique, the Nth order of a year collided with probability ~N/9000, and every
-- collision failed the order insert after stock had already been decremented. Numbers are now
-- handed out by the database.
--
-- A per-year counter row rather than a SEQUENCE: a sequence can't restart each year without DDL
-- at year rollover, and creating one per year from inside a trigger isn't race-safe. The
-- INSERT ... ON CONFLICT DO UPDATE below row-locks that year's row, so concurrent orders are
-- serialised and each gets a distinct number. It runs inside the order insert's own transaction,
-- so a failed insert rolls its number back too (no gaps).
--
-- The year is Pakistan time, same as coupon expiry (lib/coupon-dates.ts). The trigger only fills
-- order_number when the insert leaves it null, so scripts/seed-supabase.ts can keep inserting its
-- fixed demo numbers (4-digit, e.g. ORD-2026-4821 — they can never equal a 6-digit generated one).

create table order_number_counters (
  year int primary key,
  last_value int not null check (last_value > 0)
);

-- Only next_order_number (security definer) touches this; RLS with no policies = no client access.
alter table order_number_counters enable row level security;
revoke all on table order_number_counters from public, anon, authenticated;

create or replace function next_order_number(p_placed_at timestamptz)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year int := extract(year from p_placed_at at time zone 'Asia/Karachi')::int;
  v_value int;
begin
  insert into order_number_counters as c (year, last_value)
  values (v_year, 1)
  on conflict (year) do update set last_value = c.last_value + 1
  returning c.last_value into v_value;

  -- Zero-padded to 6 digits; widens past 999999 instead of lpad truncating (which would collide).
  return format('ORD-%s-%s', v_year, lpad(v_value::text, greatest(6, length(v_value::text)), '0'));
end;
$$;

revoke all on function next_order_number(timestamptz) from public, anon, authenticated;
grant execute on function next_order_number(timestamptz) to service_role;

create or replace function set_order_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.order_number is null then
    -- placed_at's default (now()) is already applied when a BEFORE trigger runs
    new.order_number := next_order_number(coalesce(new.placed_at, now()));
  end if;
  return new;
end;
$$;

create trigger orders_set_order_number
  before insert on orders
  for each row execute function set_order_number();
