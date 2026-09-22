import { deleteFromBucket, uploadToBucket } from "@/lib/admin/storage";

const BUCKET = "store-assets";

// Uploads the store logo or favicon to the store-assets Storage bucket and returns its public
// URL. Writes are admin-only via the store_assets_admin_insert Storage policy — see
// lib/admin/storage.ts for the shared upload/delete implementation.
export async function uploadStoreAsset(file: File): Promise<string | null> {
  return uploadToBucket(BUCKET, file, "png");
}

// Removes an uploaded asset given its public URL.
export async function deleteStoreAsset(url: string): Promise<void> {
  return deleteFromBucket(BUCKET, url);
}
