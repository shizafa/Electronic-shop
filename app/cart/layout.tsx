import { ProductCatalogProvider } from "@/context/product-catalog-context";

// Scopes the product-catalog fetch to just this route — cart-view.tsx needs it to resolve
// stored product/variant ids into full product data.
export default function CartLayout({ children }: LayoutProps<"/cart">) {
  return <ProductCatalogProvider>{children}</ProductCatalogProvider>;
}
