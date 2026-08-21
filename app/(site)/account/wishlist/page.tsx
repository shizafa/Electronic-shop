import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist/wishlist-view";
import { ProductCatalogProvider } from "@/context/product-catalog-context";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("account.wishlist"),
};

// /account/wishlist route: renders the saved wishlist items. Wrapped locally in
// ProductCatalogProvider (rather than a shared layout like /wishlist's) since this page lives
// under the account layout tree, not a standalone route segment of its own.
export default function AccountWishlistPage() {
  return (
    <ProductCatalogProvider>
      <WishlistView />
    </ProductCatalogProvider>
  );
}