"use server";

import { createClient } from "@/lib/supabase/server";

export interface SubmitReviewInput {
  productId: string;
  rating: number;
  title: string;
  body: string;
}

export type SubmitReviewResult = { success: true } | { success: false; error: string };

// Places a review as 'pending' (reviews.status default) — never visible publicly until an
// admin approves it (lib/actions/admin/reviews.ts). is_verified_purchase is computed here,
// not trusted from the client: true only if this customer has a delivered order containing
// this product. Runs under the caller's own RLS-scoped session (reviews_insert_own,
// order_items_select_own/orders_select_own) — no service-role client needed.
export async function submitReview(input: SubmitReviewInput): Promise<SubmitReviewResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You need to be signed in to write a review" };

  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return { success: false, error: "Rating must be between 1 and 5" };
  }
  if (!input.title.trim() || !input.body.trim()) {
    return { success: false, error: "Please fill in a title and a review" };
  }

  const { data: deliveredItem } = await supabase
    .from("order_items")
    .select("id, orders!inner(status, user_id)")
    .eq("product_id", input.productId)
    .eq("orders.user_id", user.id)
    .eq("orders.status", "delivered")
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("reviews").insert({
    product_id: input.productId,
    user_id: user.id,
    rating: input.rating,
    title: input.title.trim(),
    body: input.body.trim(),
    is_verified_purchase: Boolean(deliveredItem),
  });

  if (error) {
    if (error.code === "23505") return { success: false, error: "You've already reviewed this product" };
    return { success: false, error: "Failed to submit review" };
  }

  // No revalidatePath here: a pending review changes nothing on the (public, approved-only)
  // product page yet — the rating trigger only fires for approved rows. Revalidation happens
  // in lib/actions/admin/reviews.ts when a review is actually approved.
  return { success: true };
}
