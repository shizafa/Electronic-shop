-- Storage bucket for category thumbnail/banner images uploaded from the admin dashboard.
-- Same shape as 0003_product_images_bucket.sql, separate bucket so category imagery doesn't
-- mix with product imagery. Run once in the Supabase SQL editor (or via `supabase db push`).

insert into storage.buckets (id, name, public)
values ('category-images', 'category-images', true)
on conflict (id) do nothing;

create policy "category_images_public_read" on storage.objects
  for select using (bucket_id = 'category-images');

create policy "category_images_admin_insert" on storage.objects
  for insert with check (bucket_id = 'category-images' and is_admin(auth.uid()));

create policy "category_images_admin_update" on storage.objects
  for update using (bucket_id = 'category-images' and is_admin(auth.uid()));

create policy "category_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'category-images' and is_admin(auth.uid()));
