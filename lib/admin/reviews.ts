import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { AdminReview } from "@/types/review";

// Admin-scoped review reads — sees every status (reviews_select_admin RLS), unlike the public
// getApprovedReviewsForProduct in lib/reviews.ts. Cookie-bound client is sufficient (no
// service-role client needed), same reasoning as lib/admin/orders.ts.

interface AdminReviewRow {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  body: string;
  status: AdminReview["status"];
  is_verified_purchase: boolean;
  created_at: string;
  reviewed_at: string | null;
  profiles: { name: string } | null;
  products: { name: string } | null;
}

function mapAdminReviewRow(row: AdminReviewRow): AdminReview {
  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    authorName: row.profiles?.name ?? "",
    productName: row.products?.name ?? "",
    rating: row.rating,
    title: row.title,
    body: row.body,
    status: row.status,
    isVerifiedPurchase: row.is_verified_purchase,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at ?? undefined,
  };
}

export async function getAllReviewsForAdmin(): Promise<AdminReview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles(name), products(name)")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getAllReviewsForAdmin failed", error);
    return [];
  }
  return (data ?? []).map((row) => mapAdminReviewRow(row as unknown as AdminReviewRow));
}
