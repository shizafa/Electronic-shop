"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/actions/admin/guard";

export type ReviewActionResult = { success: true } | { success: false; error: string };

// Approve/reject only — there's no admin action that reopens a review back to 'pending'.
type ModerationStatus = "approved" | "rejected";

function revalidateReviewPaths(productIds: string[]) {
  revalidatePath("/admin/reviews");
  // products.id doubles as its slug (see slugify in lib/actions/admin/products.ts), so this is
  // the product page's real path — same convention revalidateProductPaths already relies on.
  for (const productId of new Set(productIds)) revalidatePath(`/product/${productId}`);
}

export async function updateReviewStatus(id: string, status: ModerationStatus): Promise<ReviewActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { data, error } = await guard.supabase
    .from("reviews")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .select("product_id")
    .single();

  if (error || !data) return { success: false, error: "Failed to update review" };
  revalidateReviewPaths([data.product_id]);
  return { success: true };
}

export async function bulkUpdateReviewStatus(ids: string[], status: ModerationStatus): Promise<ReviewActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };
  if (ids.length === 0) return { success: true };

  const { data, error } = await guard.supabase
    .from("reviews")
    .update({ status, reviewed_at: new Date().toISOString() })
    .in("id", ids)
    .select("product_id");

  if (error) return { success: false, error: "Failed to update reviews" };
  revalidateReviewPaths((data ?? []).map((row) => row.product_id));
  return { success: true };
}
