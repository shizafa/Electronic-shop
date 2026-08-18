import { readJSON, writeJSON } from "@/lib/storage";
import type { CompareItem } from "@/types/cart";

const COMPARE_KEY = "electronics_compare";
const MAX_COMPARE_ITEMS = 4;

// Result of trying to add a product to compare: success, or a reason it was rejected
export type AddToCompareResult =
  | { success: true; items: CompareItem[] }
  | { success: false; reason: "different_category" | "limit_reached"; items: CompareItem[] };

// Reads the current list of products being compared
export function getCompareList(): CompareItem[] {
  return readJSON<CompareItem[]>(COMPARE_KEY, []);
}

// Adds a product to compare; rejects if the list is full or the category doesn't match.
// Callers already have the full Product in hand (it's rendered on the page), so this only
// needs its categoryId — no catalog lookup required.
export function addToCompare(productId: string, categoryId: string): AddToCompareResult {
  const items = getCompareList();
  if (items.some((item) => item.productId === productId)) {
    return { success: true, items }; // already in the list, nothing to do
  }

  if (items.length >= MAX_COMPARE_ITEMS) {
    return { success: false, reason: "limit_reached", items };
  }

  const existingCategoryId = items[0]?.categoryId;

  // Only allow comparing products from the same category (e.g. TVs with TVs)
  if (existingCategoryId && categoryId !== existingCategoryId) {
    return { success: false, reason: "different_category", items };
  }

  const updatedItems = [...items, { productId, categoryId }];
  writeJSON(COMPARE_KEY, updatedItems);
  return { success: true, items: updatedItems };
}

// Removes one product from the compare list
export function removeFromCompare(productId: string): CompareItem[] {
  const updatedItems = getCompareList().filter((item) => item.productId !== productId);
  writeJSON(COMPARE_KEY, updatedItems);
  return updatedItems;
}

// Empties the compare list
export function clearCompare(): void {
  writeJSON(COMPARE_KEY, []);
}