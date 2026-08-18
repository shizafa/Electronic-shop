import { ProductCatalogProvider } from "@/context/product-catalog-context";

// Scopes the product-catalog fetch to just this route — wishlist-view.tsx needs it to resolve
// stored product/variant ids into full product data.
export default function WishlistLayout({ children }: LayoutProps<"/wishlist">) {
  return <ProductCatalogProvider>{children}</ProductCatalogProvider>;
}
