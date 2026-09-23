import { deleteFromBucket, uploadToBucket } from "@/lib/admin/storage";

const BUCKET = "product-images";

// Uploads a single image file to the product-images Storage bucket and returns its public
// URL. Writes are admin-only via the product_images_admin_insert Storage policy — see
// lib/admin/storage.ts for the shared upload/delete implementation.
export async function uploadProductImage(file: File): Promise<string | null> {
  return uploadToBucket(BUCKET, file, "jpg");
}

// Removes an uploaded image given its public URL.
export async function deleteProductImage(url: string): Promise<void> {
  return deleteFromBucket(BUCKET, url);
}
