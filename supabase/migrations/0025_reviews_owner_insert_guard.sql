-- Stops a signed-in user from inserting a review that skips moderation. reviews_insert_own
-- (0009_reviews.sql) only checks user_id = auth.uid(), and the anon key + a user session can hit
-- the table directly, so a client could insert straight to status 'approved' with
-- is_verified_purchase = true — the insert-side twin of the hole 0017 closed for updates. Run
-- once in the Supabase SQL editor (or via `supabase db push`), same as the earlier migrations.
--
-- Resets instead of raising (0017's approach, not 0024's): the only customer writer,
-- lib/actions/reviews.ts's submitReview, legitimately sends is_verified_purchase, so "the column
-- was sent" can't be treated as tampering. The trigger just overwrites the moderation fields with
-- the values every new customer review must have.
--
-- is_verified_purchase is recomputed here with the same rule submitReview uses (the caller has a
-- delivered order containing this product), so the database decides the badge, not whatever the
-- client sent. Runs as the caller: orders_select_own / order_items_select_own already let a
-- customer read their own orders, which is all this check needs.
--
-- Admin sessions (is_admin) and service-role / SQL-editor sessions (auth.uid() is null) pass
-- through untouched, same as 0017 and 0024.

create or replace function reviews_guard_owner_insert()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if auth.uid() is null or is_admin(auth.uid()) then
    return new;
  end if;

  new.status := 'pending';
  new.reviewed_at := null;
  new.created_at := now();
  new.is_verified_purchase := exists (
    select 1
      from order_items oi
      join orders o on o.id = oi.order_id
     where oi.product_id = new.product_id
       and o.user_id = auth.uid()
       and o.status = 'delivered'
  );
  return new;
end;
$$;

create trigger reviews_guard_owner_insert
  before insert on reviews
  for each row execute function reviews_guard_owner_insert();
