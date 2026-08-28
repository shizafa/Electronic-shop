"use server";

import { getAllCategories } from "@/lib/categories";
import { getAllProducts } from "@/lib/products";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

export interface DealsOfTheDayData {
  products: Product[];
  categories: Category[];
}

// Server Function invoked by DealsOfTheDayLazy once it scrolls into view. getAllProducts and
// getAllCategories are wrapped in React's cache(), so this doesn't duplicate the same request
// CategoryTiles already made — it's simply a separate request in the first place, since this
// section's whole point is to fetch after the initial page load rather than during it.
export async function loadDealsOfTheDay(): Promise<DealsOfTheDayData> {
  const [products, categories] = await Promise.all([getAllProducts(), getAllCategories()]);
  return { products, categories };
}
