export type ReviewStatus = "pending" | "approved" | "rejected";

// A customer's review of a product. Public reads (RLS) only ever see status === "approved" —
// pending/rejected rows are only visible to admins (moderation) or, implicitly, the author's
// own insert.
export interface Review {
  id: string;
  productId: string;
  userId: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  status: ReviewStatus;
  isVerifiedPurchase: boolean;
  createdAt: string;
  reviewedAt?: string;
}

// Admin moderation list needs the product's name too (reviews-table has no product context of
// its own, unlike the storefront's product-scoped list).
export interface AdminReview extends Review {
  productName: string;
}
