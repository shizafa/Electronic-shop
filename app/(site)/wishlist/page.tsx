import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist/wishlist-view";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("nav.wishlist"),
};

// /wishlist route: renders the wishlist view (guest-accessible, unlike /account/wishlist)
export default function WishlistPage() {
  return <WishlistView />;
}