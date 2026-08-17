import { getAllProducts } from "@/lib/products";
import { readJSON, writeJSON } from "@/lib/storage";
import type { CompareItem } from "@/types/cart";

const COMPARE_KEY = "electronics_compare";
const MAX_COMPARE_ITEMS = 4;

export type AddToCompareResult =
  | { success: true; items: CompareItem[] }
  | { success: false; reason: "different_category" | "limit_reached"; items: CompareItem[] };

export function getCompareList(): CompareItem[] {
  return readJSON<CompareItem[]>(COMPARE_KEY, []);
}

export function addToCompare(productId: string): AddToCompareResult {
  const items = getCompareList();
  if (items.some((item) => item.productId === productId)) {
    return { success: true, items };
  }

  if (items.length >= MAX_COMPARE_ITEMS) {
    return { success: false, reason: "limit_reached", items };
  }

  const allProducts = getAllProducts();
  const newProductCategoryId = allProducts.find((product) => product.id === productId)?.categoryId;
  const existingCategoryId =
    items.length > 0
      ? allProducts.find((product) => product.id === items[0].productId)?.categoryId
      : undefined;

  if (existingCategoryId && newProductCategoryId !== existingCategoryId) {
    return { success: false, reason: "different_category", items };
  }

  const updatedItems = [...items, { productId }];
  writeJSON(COMPARE_KEY, updatedItems);
  return { success: true, items: updatedItems };
}

export function removeFromCompare(productId: string): CompareItem[] {
  const updatedItems = getCompareList().filter((item) => item.productId !== productId);
  writeJSON(COMPARE_KEY, updatedItems);
  return updatedItems;
}

export function clearCompare(): void {
  writeJSON(COMPARE_KEY, []);
}