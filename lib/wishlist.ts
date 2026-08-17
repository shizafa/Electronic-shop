import { readJSON, writeJSON } from "@/lib/storage";
import type { WishlistItem } from "@/types/cart";

const GUEST_WISHLIST_KEY = "electronics_wishlist_guest";
const userWishlistKey = (userId: string) => `electronics_wishlist_${userId}`;

function wishlistKey(userId: string | null): string {
  return userId ? userWishlistKey(userId) : GUEST_WISHLIST_KEY;
}

function isSameItem(a: WishlistItem, b: WishlistItem): boolean {
  return a.productId === b.productId && a.variantId === b.variantId;
}

export function getWishlist(userId: string | null): WishlistItem[] {
  return readJSON<WishlistItem[]>(wishlistKey(userId), []);
}

export function addToWishlist(userId: string | null, item: WishlistItem): WishlistItem[] {
  const items = getWishlist(userId);
  if (items.some((existing) => isSameItem(existing, item))) return items;

  const updatedItems = [...items, item];
  writeJSON(wishlistKey(userId), updatedItems);
  return updatedItems;
}

export function removeFromWishlist(userId: string | null, item: WishlistItem): WishlistItem[] {
  const updatedItems = getWishlist(userId).filter((existing) => !isSameItem(existing, item));
  writeJSON(wishlistKey(userId), updatedItems);
  return updatedItems;
}

export function mergeGuestWishlistIntoUser(userId: string): WishlistItem[] {
  const guestItems = getWishlist(null);
  if (guestItems.length === 0) return getWishlist(userId);

  const merged = [...getWishlist(userId)];
  for (const guestItem of guestItems) {
    if (!merged.some((existing) => isSameItem(existing, guestItem))) {
      merged.push(guestItem);
    }
  }

  writeJSON(wishlistKey(userId), merged);
  writeJSON(wishlistKey(null), []);
  return merged;
}