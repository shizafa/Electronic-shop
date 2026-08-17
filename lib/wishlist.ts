import { readJSON, writeJSON } from "@/lib/storage";
import type { WishlistItem } from "@/types/cart";

const GUEST_WISHLIST_KEY = "electronics_wishlist_guest";
const userWishlistKey = (userId: string) => `electronics_wishlist_${userId}`;

// Picks the right localStorage key: shared guest wishlist, or a per-user wishlist
function wishlistKey(userId: string | null): string {
  return userId ? userWishlistKey(userId) : GUEST_WISHLIST_KEY;
}

// Two wishlist items are the same if they point at the same product and variant
function isSameItem(a: WishlistItem, b: WishlistItem): boolean {
  return a.productId === b.productId && a.variantId === b.variantId;
}

// Reads the wishlist for a logged-in user, or the guest wishlist if userId is null
export function getWishlist(userId: string | null): WishlistItem[] {
  return readJSON<WishlistItem[]>(wishlistKey(userId), []);
}

// Adds an item to the wishlist, ignoring it if already present
export function addToWishlist(userId: string | null, item: WishlistItem): WishlistItem[] {
  const items = getWishlist(userId);
  if (items.some((existing) => isSameItem(existing, item))) return items;

  const updatedItems = [...items, item];
  writeJSON(wishlistKey(userId), updatedItems);
  return updatedItems;
}

// Removes a matching item from the wishlist
export function removeFromWishlist(userId: string | null, item: WishlistItem): WishlistItem[] {
  const updatedItems = getWishlist(userId).filter((existing) => !isSameItem(existing, item));
  writeJSON(wishlistKey(userId), updatedItems);
  return updatedItems;
}

// After login, folds items wishlisted as a guest into the user's own wishlist, then clears the guest one
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
  writeJSON(wishlistKey(null), []); // guest wishlist is now empty
  return merged;
}