import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist/wishlist-view";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("nav.wishlist"),
};

export default function WishlistPage() {
  return (
    <div className="container-page py-8">
      <WishlistView />
    </div>
  );
}