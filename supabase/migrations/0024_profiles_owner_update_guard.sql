-- Stops a signed-in user from promoting themselves to admin. profiles_update_own (0001_init.sql)
-- lets the owner write every column of their own row, and the anon key + a user session can hit
-- the table directly, so without this any customer could set is_admin = true on themselves —
-- which proxy.ts, requireAdmin() and every is_admin(auth.uid()) policy then trust. Run once in
-- the Supabase SQL editor (or via `supabase db push`), same as the earlier migrations.
--
-- A trigger, not column-level grants, for the same reason as 0017_reviews_owner_update_guard.sql:
-- admins use the same `authenticated` role, so revoking update on is_admin would lock them out
-- too. Service-role / SQL-editor sessions (auth.uid() is null) pass through untouched — that's
-- how admins get granted in the first place. Unlike 0017 this raises instead of silently
-- reverting: no legitimate client write sends these columns (lib/auth.ts's updateUserProfile
-- only writes name/phone), so a change here is always tampering and should fail loudly.
--
-- Column audit: profiles is id, name, phone, is_admin, created_at (0001; no later migration
-- alters it). Email isn't on profiles — it lives on auth.users. name/phone stay owner-editable.

create or replace function profiles_guard_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new; -- service role / SQL editor
  end if;

  -- id is the auth.users FK and created_at is the signup time: no JWT caller, admin or not,
  -- has a reason to rewrite either.
  if new.id is distinct from old.id or new.created_at is distinct from old.created_at then
    raise exception 'profiles.id and profiles.created_at cannot be changed'
      using errcode = '42501';
  end if;

  if new.is_admin is distinct from old.is_admin and not is_admin(auth.uid()) then
    raise exception 'Only admins can change profiles.is_admin'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger profiles_guard_update
  before update on profiles
  for each row execute function profiles_guard_update();
