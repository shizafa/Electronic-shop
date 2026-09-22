-- Atomic save for a user's address book. Run once in the Supabase SQL editor (or via
-- `supabase db push`), same as the earlier migrations.
--
-- lib/auth.ts's updateUserAddresses used to delete every address the user had, then re-insert
-- the submitted list in a second call. If the insert failed, the delete had already happened and
-- the user lost every saved address. This diffs the submitted list against the user's existing
-- rows in one transaction instead — any error rolls the whole save back:
--   - an element whose id matches one of the caller's rows updates that row, only if a field
--     actually changed
--   - any other element (the address book's `addr-<timestamp>` temp ids, or an id the caller
--     doesn't own) is inserted as a new row
--   - the caller's rows whose ids aren't in the submitted list are deleted
--
-- Inserts use clock_timestamp() for created_at, not the default now(): now() is fixed for the
-- whole transaction, so every address added in the same save would share one created_at and
-- loadUser's `order by created_at` would return them in arbitrary order.
--
-- Rows are written one statement at a time, so 0030's addresses_unset_other_defaults trigger
-- sees each earlier write — this closes the multi-row-INSERT gap noted in 0030's header.
--
-- Security: security invoker, so addresses_all_own RLS still applies to every statement; every
-- statement is also explicitly scoped to auth.uid(). Execute is granted to authenticated only.

create or replace function save_user_addresses(p_addresses jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_element jsonb;
  v_raw_id text;
  v_id uuid;
  v_kept_ids uuid[] := '{}';
begin
  if v_user_id is null then
    raise exception 'save_user_addresses: not authenticated';
  end if;

  if p_addresses is null or jsonb_typeof(p_addresses) <> 'array' then
    raise exception 'save_user_addresses: p_addresses must be a JSON array';
  end if;

  for v_element in select value from jsonb_array_elements(p_addresses) with ordinality order by ordinality
  loop
    v_raw_id := v_element->>'id';
    v_id := null;

    if v_raw_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      select id into v_id from addresses where id = v_raw_id::uuid and user_id = v_user_id;
    end if;

    if v_id is not null then
      update addresses
         set label = v_element->>'label',
             full_name = v_element->>'full_name',
             phone = v_element->>'phone',
             city = v_element->>'city',
             area = v_element->>'area',
             address_line = v_element->>'address_line',
             is_default = coalesce((v_element->>'is_default')::boolean, false)
       where id = v_id
         and user_id = v_user_id
         and (label, full_name, phone, city, area, address_line, is_default)
             is distinct from
             (v_element->>'label', v_element->>'full_name', v_element->>'phone', v_element->>'city',
              v_element->>'area', v_element->>'address_line',
              coalesce((v_element->>'is_default')::boolean, false));
    else
      insert into addresses (user_id, label, full_name, phone, city, area, address_line, is_default, created_at)
      values (
        v_user_id,
        v_element->>'label',
        v_element->>'full_name',
        v_element->>'phone',
        v_element->>'city',
        v_element->>'area',
        v_element->>'address_line',
        coalesce((v_element->>'is_default')::boolean, false),
        clock_timestamp()
      )
      returning id into v_id;
    end if;

    v_kept_ids := v_kept_ids || v_id;
  end loop;

  delete from addresses
   where user_id = v_user_id
     and id <> all(v_kept_ids);
end;
$$;

revoke all on function save_user_addresses(jsonb) from public, anon;
grant execute on function save_user_addresses(jsonb) to authenticated;
