import { cache } from "react";
import { createClient as createPublicClient } from "@/lib/supabase/public";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { Review, UserReview } from "@/types/review";

// Public, unauthenticated reads only ever see approved reviews (reviews_select_public RLS) —
// same public client as lib/products.ts, for the same reason: no cookies() means the product
// page can stay statically generated rather than forced dynamic.

interface ReviewRow {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  body: string;
  status: Review["status"];
  is_verified_purchase: boolean;
  created_at: string;
  reviewed_at: string | null;
  profiles: { name: string } | null;
}

function mapReviewRow(row: ReviewRow): Review {
  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    authorName: row.profiles?.name ?? "",
    rating: row.rating,
    title: row.title,
    body: row.body,
    status: row.status,
    isVerifiedPurchase: row.is_verified_purchase,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at ?? undefined,
  };
}

// Approved reviews for a product, newest first — what the product page's ReviewsSection renders.
export const getApprovedReviewsForProduct = cache(async (productId: string): Promise<Review[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles(name)")
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getApprovedReviewsForProduct failed", error);
    return [];
  }
  return (data ?? []).map((row) => mapReviewRow(row as unknown as ReviewRow));
});

interface UserReviewRow extends ReviewRow {
  products: { name: string; slug: string } | null;
}

function mapUserReviewRow(row: UserReviewRow): UserReview {
  return {
    ...mapReviewRow(row),
    productName: row.products?.name ?? "",
    productSlug: row.products?.slug ?? "",
  };
}

// A signed-in user's own reviews, every status, newest first — powers /account/reviews. Uses the
// browser client (not the public one above) so the reviews_select_own RLS policy — auth.uid() =
// user_id — sees pending/rejected rows too, not just approved ones. Call from a client component
// with the current user's id, same pattern as lib/orders.ts's getOrdersForUser.
export async function getReviewsForUser(userId: string): Promise<UserReview[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles(name), products(name, slug)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getReviewsForUser failed", error);
    return [];
  }
  return (data ?? []).map((row) => mapUserReviewRow(row as unknown as UserReviewRow));
}
