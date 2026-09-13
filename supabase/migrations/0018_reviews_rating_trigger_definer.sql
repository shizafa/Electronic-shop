-- Makes the rating-recompute trigger (0009_reviews.sql) actually work for customer writes.
-- It ran as the calling user, and only admins have an update grant on products
-- (products_admin_update), so when a customer edited or deleted their own review from
-- /account/reviews (0014), the trigger's `update products` matched nothing under RLS and
-- average_rating/review_count silently kept counting the old review. Run once in the Supabase
-- SQL editor (or via `supabase db push`), same as the earlier migrations.
--
-- security definer on the trigger function only: it runs as its owner, so the nested
-- update_product_rating call does too. PostgREST doesn't expose functions returning `trigger`,
-- so clients can't call this one directly, and update_product_rating stays an invoker function
-- (still RLS-limited if someone calls it via rpc). Body is unchanged from 0009.

create or replace function reviews_recompute_product_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform update_product_rating(old.product_id);
  elsif tg_op = 'UPDATE' and old.product_id is distinct from new.product_id then
    perform update_product_rating(old.product_id);
    perform update_product_rating(new.product_id);
  else
    perform update_product_rating(new.product_id);
  end if;
  return null;
end;
$$;

-- One-off resync: products whose rating went stale from earlier customer edits/deletes.
update products p
  set average_rating = coalesce(
        (select round(avg(r.rating)::numeric, 1) from reviews r where r.product_id = p.id and r.status = 'approved'),
        0
      ),
      review_count = (select count(*) from reviews r where r.product_id = p.id and r.status = 'approved');
