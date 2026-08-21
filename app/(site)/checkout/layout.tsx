import { ProductCatalogProvider } from "@/context/product-catalog-context";

// Scopes the product-catalog fetch to /checkout and /checkout/confirmation — checkout-flow.tsx
// needs it to resolve cart items into full product/variant data for pricing and display.
export default function CheckoutLayout({ children }: LayoutProps<"/checkout">) {
  return <ProductCatalogProvider>{children}</ProductCatalogProvider>;
}
