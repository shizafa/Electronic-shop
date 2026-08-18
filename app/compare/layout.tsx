import { ProductCatalogProvider } from "@/context/product-catalog-context";

// Scopes the product-catalog fetch to just this route — compare-view.tsx needs it to resolve
// compared product ids into full product/spec data.
export default function CompareLayout({ children }: LayoutProps<"/compare">) {
  return <ProductCatalogProvider>{children}</ProductCatalogProvider>;
}
