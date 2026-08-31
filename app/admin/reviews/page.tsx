import { ReviewsView } from "@/components/admin/reviews/reviews-view";
import { getAllReviewsForAdmin } from "@/lib/admin/reviews";

export default async function AdminReviewsPage() {
  const reviews = await getAllReviewsForAdmin();
  return <ReviewsView reviews={reviews} />;
}
