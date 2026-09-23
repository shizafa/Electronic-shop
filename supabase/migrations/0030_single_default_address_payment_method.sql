-- Enforces at most one is_default row per user on addresses and payment_methods, via triggers
-- rather than a partial unique index. Chosen over the index because payment_methods'
-- clearOtherDefaults (lib/actions/payment-methods.ts) unsets the old default *after* the new
-- one is written — an immediate unique index would reject that write before cleanup ever runs.
-- A trigger self-heals instead, so no app code changes are needed on either table (the now-
-- redundant clearOtherDefaults call becomes a harmless no-op).
--
-- One-time dedupe first: picks the most-recently-created row per user as the surviving default
-- wherever more than one already exists, so the constraint the triggers enforce holds from the
-- start. No-op if there's no current duplication.
--
-- Security: plain invoker functions, no security definer. Unlike the reviews/profiles guard
-- triggers (0017/0024/0025), which touch rows the invoker doesn't own, this only updates the
-- same user's own other rows on the same table — already permitted by addresses_all_own /
-- payment_methods_all_own RLS, so the owner's own session has every grant this needs.
--
-- Known limitation: lib/auth.ts's updateUserAddresses inserts a user's whole address list in one
-- multi-row INSERT. Sibling rows in that same statement aren't visible to each other's BEFORE
-- trigger, so if the client ever sent two rows with is_default = true in the same save, this
-- trigger won't catch that pair — it only unsets rows that already existed before the statement
-- started. It does cover every other path: a single row flipped to default later, and the
-- payment_methods insert/update flow, both single-row writes.

with ranked_addresses as (
  select id, user_id, row_number() over (partition by user_id order by created_at desc) as rn
  from addresses
  where is_default
)
update addresses a
set is_default = false
from ranked_addresses r
where a.id = r.id and r.rn > 1;

with ranked_payment_methods as (
  select id, user_id, row_number() over (partition by user_id order by created_at desc) as rn
  from payment_methods
  where is_default
)
update payment_methods p
set is_default = false
from ranked_payment_methods r
where p.id = r.id and r.rn > 1;

create or replace function addresses_unset_other_defaults()
returns trigger
language plpgsql
as $$
begin
  update addresses set is_default = false
    where user_id = new.user_id and id <> new.id and is_default;
  return new;
end;
$$;

create trigger addresses_unset_other_defaults
  before insert or update on addresses
  for each row when (new.is_default)
  execute function addresses_unset_other_defaults();

create or replace function payment_methods_unset_other_defaults()
returns trigger
language plpgsql
as $$
begin
  update payment_methods set is_default = false
    where user_id = new.user_id and id <> new.id and is_default;
  return new;
end;
$$;

create trigger payment_methods_unset_other_defaults
  before insert or update on payment_methods
  for each row when (new.is_default)
  execute function payment_methods_unset_other_defaults();
