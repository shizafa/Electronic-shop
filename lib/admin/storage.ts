import { createClient } from "@/lib/supabase/client";

// Shared Supabase Storage helpers behind lib/admin/product-images.ts, category-images.ts and
// store-assets.ts — the same upload/delete pair, one bucket each. Runs from the browser (not a
// Server Action) so large files don't round-trip through the server; each bucket's own
// admin-only insert policy enforces access the same way table RLS does elsewhere in this app.

// Uploads a file under a generated name and returns its public URL, or null if the upload failed.
export async function uploadToBucket(
  bucket: string,
  file: File,
  fallbackExtension: string
): Promise<string | null> {
  const supabase = createClient();
  const extension = file.name.split(".").pop() ?? fallbackExtension;
  const path = `${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: "3600" });
  if (error) {
    console.error(`uploadToBucket(${bucket}) failed`, error);
    return null;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// Removes an uploaded file given its public URL. Best-effort — if the URL isn't from this
// bucket (e.g. seed data pointing at an external host), this silently does nothing.
export async function deleteFromBucket(bucket: string, url: string): Promise<void> {
  const marker = `/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return;

  const path = url.slice(index + marker.length);
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) console.error(`deleteFromBucket(${bucket}) failed`, error);
}
