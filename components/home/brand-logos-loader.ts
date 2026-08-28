"use server";

import type { BrandTile } from "@/components/home/brand-logos";
import { resolveBrandLogo } from "@/lib/brand-logo";
import { getDisplayVariant } from "@/lib/product-helpers";
import { getAllProducts } from "@/lib/products";
import type { Product } from "@/types/product";

function discountPercentFor(product: Product): number {
  const variant = getDisplayVariant(product);
  if (!variant || variant.compareAtPrice === undefined || variant.compareAtPrice <= variant.price) return 0;
  return Math.round(((variant.compareAtPrice - variant.price) / variant.compareAtPrice) * 100);
}

// Server Function invoked by BrandLogosLazy once it scrolls into view. Logo resolution
// (fs-based, via resolveBrandLogo) and the discount aggregation both need to happen here on
// the server — BrandLogos itself only ever receives the resulting plain data.
export async function loadBrandLogos(): Promise<BrandTile[]> {
  const products = await getAllProducts();

  const brands = new Map<string, { count: number; maxDiscount: number }>();
  for (const product of products) {
    const existing = brands.get(product.brand) ?? { count: 0, maxDiscount: 0 };
    const discount = discountPercentFor(product);
    brands.set(product.brand, {
      count: existing.count + 1,
      maxDiscount: Math.max(existing.maxDiscount, discount),
    });
  }

  // Template ships exactly 10 brand tiles; show the 10 brands with the most products.
  return Array.from(brands.entries())
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10)
    .map(([brandName, { maxDiscount }]) => ({
      brandName,
      logoSrc: resolveBrandLogo(brandName),
      maxDiscount,
    }));
}
