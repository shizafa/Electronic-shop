-- Lets a signed-in user see, edit, and delete their own reviews regardless of moderation status.
-- 0009_reviews.sql only gave public read of approved rows and admin read of everything — a user
-- had no way to see (or manage) their own pending/rejected review. Powers /account/reviews. Run
-- once in the Supabase SQL editor (or via `supabase db push`), same as the earlier migrations.
--
-- Editing a review resets its status back to 'pending' (done in lib/actions/reviews.ts's
-- updateReview, not here) so an edited review is re-moderated before it's public again — RLS
-- itself doesn't need to know or care about that.

create policy "reviews_select_own" on reviews for select using (auth.uid() = user_id);
create policy "reviews_update_own" on reviews for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reviews_delete_own" on reviews for delete using (auth.uid() = user_id);
