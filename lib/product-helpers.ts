import type { Product, Variant } from "@/types/product";

// Pure helpers over already-fetched Product/Variant data — kept separate from lib/products.ts
// (which now does server-only Supabase queries) so client components can still import these
// without pulling in a next/headers dependency.

// Picks the variant shown by default on a product card: cheapest among in-stock ones (or cheapest overall if none in stock)
export function getDisplayVariant(product: Product): Variant {
  const inStockVariants = product.variants.filter((variant) => variant.stock > 0);
  const candidates = inStockVariants.length > 0 ? inStockVariants : product.variants;
  return candidates.reduce((cheapest, variant) => (variant.price < cheapest.price ? variant : cheapest));
}

// Builds a human-readable label for a variant, e.g. "128GB • Black"
export function formatVariantLabel(product: Product, variant: Variant): string {
  return product.variantAxes
    .map((axis) => {
      const value = variant.axisValues[axis.id];
      if (!axis.unit) return value;
      return axis.unit === '"' ? `${value}${axis.unit}` : `${value} ${axis.unit}`; // no space before " (inches)
    })
    .join(" • ");
}
