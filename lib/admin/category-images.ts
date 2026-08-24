import { createClient } from "@/lib/supabase/client";

const BUCKET = "category-images";

// Uploads a single image file to the category-images Storage bucket and returns its public
// URL. Runs from the browser (not a Server Action) so large files don't round-trip through
// the server — Storage RLS (category_images_admin_insert) enforces admin-only writes the same
// way table RLS does elsewhere in this app.
export async function uploadCategoryImage(file: File): Promise<string | null> {
  const supabase = createClient();
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: "3600" });
  if (error) {
    console.error("uploadCategoryImage failed", error);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Removes an uploaded image given its public URL. Best-effort — if the URL isn't from this
// bucket, this silently does nothing.
export async function deleteCategoryImage(url: string): Promise<void> {
  const marker = `/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return;

  const path = url.slice(index + marker.length);
  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.error("deleteCategoryImage failed", error);
}
