"use server";

import { getFeaturedProducts } from "@/lib/products";
import type { Product } from "@/types/product";

// Server Function invoked by WeekHighlightsLazy once it scrolls into view.
export async function loadWeekHighlights(): Promise<Product[]> {
  return getFeaturedProducts();
}
