-- Enforces in the database what lib/actions/reviews.ts's updateReview already does in code: an
-- owner's edit sends the review back to 'pending'. reviews_update_own (0014) lets the owner write
-- every column, and the anon key + a user session can hit the table directly, so without this a
-- user could flip their own review to 'approved', mark it a verified purchase, or keep a review
-- approved while swapping its text. Run once in the Supabase SQL editor (or via
-- `supabase db push`), same as the earlier migrations.
--
-- A trigger, not column-level grants: admins moderate through the same `authenticated` role, so
-- revoking update on status/reviewed_at would lock admins out too. Admin sessions (is_admin) and
-- service-role / SQL-editor sessions (auth.uid() is null) pass through untouched, so
-- lib/actions/admin/reviews.ts's approve/reject is unaffected.

create or replace function reviews_guard_owner_update()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null and not is_admin(auth.uid()) then
    new.status := 'pending';
    new.reviewed_at := null;
    new.id := old.id;
    new.product_id := old.product_id;
    new.user_id := old.user_id;
    new.is_verified_purchase := old.is_verified_purchase;
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

create trigger reviews_guard_owner_update
  before update on reviews
  for each row execute function reviews_guard_owner_update();
