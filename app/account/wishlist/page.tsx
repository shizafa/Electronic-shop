import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist/wishlist-view";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("account.wishlist"),
};

export default function AccountWishlistPage() {
  return <WishlistView />;
}