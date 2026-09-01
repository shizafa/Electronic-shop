import { createClient } from "@/lib/supabase/client";

const BUCKET = "store-assets";

// Uploads the store logo or favicon to the store-assets Storage bucket and returns its public
// URL. Same shape as lib/admin/category-images.ts — browser-side upload, admin-only writes
// enforced by store_assets_admin_insert RLS.
export async function uploadStoreAsset(file: File): Promise<string | null> {
  const supabase = createClient();
  const extension = file.name.split(".").pop() ?? "png";
  const path = `${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: "3600" });
  if (error) {
    console.error("uploadStoreAsset failed", error);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Removes an uploaded asset given its public URL. Best-effort — if the URL isn't from this
// bucket, this silently does nothing.
export async function deleteStoreAsset(url: string): Promise<void> {
  const marker = `/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return;

  const path = url.slice(index + marker.length);
  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.error("deleteStoreAsset failed", error);
}
