import type { Metadata } from "next";
import { MyReviews } from "@/components/account/my-reviews";

// See ../orders/page.tsx for why account routes are forced dynamic.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My reviews",
};

// /account/reviews route: renders the user's written reviews (see
// components/account/my-reviews.tsx for its data flow).
export default function AccountReviewsPage() {
  return <MyReviews />;
}
