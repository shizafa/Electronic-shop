import type { Product, Variant } from "@/types/product";

// Pure helpers over already-fetched Product/Variant data — kept separate from lib/products.ts
// (which now does server-only Supabase queries) so client components can still import these
// without pulling in a next/headers dependency.

// Picks the variant shown by default on a product card: cheapest among in-stock ones (or
// cheapest overall if none in stock). Returns undefined for a product with no variants at all
// (a data-entry gap, not a normal state) — callers treat that product as unsellable/unlistable.
export function getDisplayVariant(product: Product): Variant | undefined {
  if (product.variants.length === 0) return undefined;
  const inStockVariants = product.variants.filter((variant) => variant.stock > 0);
  const candidates = inStockVariants.length > 0 ? inStockVariants : product.variants;
  return candidates.reduce((cheapest, variant) => (variant.price < cheapest.price ? variant : cheapest));
}

// The single place the low-stock threshold comparison happens — admin's product table
// badge/filter and any future storefront low-stock messaging both read this instead of
// each re-implementing the "how low is low" rule.
export type StockStatus = "in" | "low" | "out";

export function getVariantStockStatus(variant: Variant): StockStatus {
  if (variant.stock <= 0) return "out";
  if (variant.stock <= variant.lowStockThreshold) return "low";
  return "in";
}

// Percent off, derived from compareAtPrice vs price — the single source of truth for "is this
// variant actually on sale" (deals filtering, product card badge, PDP "Save X%" all use this
// instead of each re-deriving it). undefined when there's no compareAtPrice or it isn't actually
// higher than price (bad data entry shouldn't read as a discount).
export function getDiscountPercent(variant: Variant): number | undefined {
  if (variant.compareAtPrice === undefined || variant.compareAtPrice <= variant.price) return undefined;
  return Math.round(((variant.compareAtPrice - variant.price) / variant.compareAtPrice) * 100);
}

// A product's status is derived from all its variants, never stored separately: out only
// when every variant is out, low when total stock has dropped to (or below) the combined
// threshold of its variants, in otherwise.
export function getProductStockStatus(product: Product): StockStatus {
  if (product.variants.length === 0) return "out";
  const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
  if (totalStock <= 0) return "out";
  const totalThreshold = product.variants.reduce((sum, variant) => sum + variant.lowStockThreshold, 0);
  if (totalStock <= totalThreshold) return "low";
  return "in";
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
