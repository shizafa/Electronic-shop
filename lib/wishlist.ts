import { createClient } from "@/lib/supabase/client";
import { readJSON, writeJSON } from "@/lib/storage";
import type { WishlistItem } from "@/types/cart";

const GUEST_WISHLIST_KEY = "electronics_wishlist_guest";

// Two wishlist items are the same if they point at the same product and variant
export function isSameItem(a: WishlistItem, b: WishlistItem): boolean {
  return a.productId === b.productId && a.variantId === b.variantId;
}

function getGuestWishlist(): WishlistItem[] {
  return readJSON<WishlistItem[]>(GUEST_WISHLIST_KEY, []);
}

function writeGuestWishlist(items: WishlistItem[]): void {
  writeJSON(GUEST_WISHLIST_KEY, items);
}

interface WishlistItemRow {
  product_id: string;
  variant_id: string | null;
}

function mapWishlistItemRow(row: WishlistItemRow): WishlistItem {
  return { productId: row.product_id, variantId: row.variant_id ?? undefined };
}

async function getUserWishlist(userId: string): Promise<WishlistItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("product_id, variant_id")
    .eq("user_id", userId);
  if (error) {
    console.error("getUserWishlist failed", error);
    return [];
  }
  return (data ?? []).map(mapWishlistItemRow);
}

// Reads the wishlist for a logged-in user, or the guest wishlist if userId is null
export async function getWishlist(userId: string | null): Promise<WishlistItem[]> {
  return userId ? getUserWishlist(userId) : getGuestWishlist();
}

// Adds an item to the wishlist, ignoring it if already present
export async function addToWishlist(userId: string | null, item: WishlistItem): Promise<WishlistItem[]> {
  if (!userId) {
    const items = getGuestWishlist();
    if (items.some((existing) => isSameItem(existing, item))) return items;
    const updatedItems = [...items, item];
    writeGuestWishlist(updatedItems);
    return updatedItems;
  }

  const alreadyPresent = (await getUserWishlist(userId)).some((existing) => isSameItem(existing, item));
  if (!alreadyPresent) {
    const supabase = createClient();
    const { error } = await supabase.from("wishlist_items").insert({
      user_id: userId,
      product_id: item.productId,
      variant_id: item.variantId ?? null,
    });
    if (error) console.error("addToWishlist failed", error);
  }

  return getUserWishlist(userId);
}

// Removes a matching item from the wishlist
export async function removeFromWishlist(
  userId: string | null,
  item: WishlistItem
): Promise<WishlistItem[]> {
  if (!userId) {
    const updatedItems = getGuestWishlist().filter((existing) => !isSameItem(existing, item));
    writeGuestWishlist(updatedItems);
    return updatedItems;
  }

  const supabase = createClient();
  let query = supabase.from("wishlist_items").delete().eq("user_id", userId).eq("product_id", item.productId);
  query = item.variantId ? query.eq("variant_id", item.variantId) : query.is("variant_id", null);
  const { error } = await query;
  if (error) console.error("removeFromWishlist failed", error);

  return getUserWishlist(userId);
}

// After login, folds items wishlisted as a guest into the user's own wishlist, then clears the guest one
export async function mergeGuestWishlistIntoUser(userId: string): Promise<WishlistItem[]> {
  const guestItems = getGuestWishlist();
  if (guestItems.length === 0) return getUserWishlist(userId);

  const userItems = await getUserWishlist(userId);
  const newItems = guestItems.filter(
    (guestItem) => !userItems.some((existing) => isSameItem(existing, guestItem))
  );

  if (newItems.length > 0) {
    const supabase = createClient();
    const rows = newItems.map((item) => ({
      user_id: userId,
      product_id: item.productId,
      variant_id: item.variantId ?? null,
    }));
    const { error } = await supabase.from("wishlist_items").insert(rows);
    if (error) console.error("mergeGuestWishlistIntoUser failed", error);
  }

  writeGuestWishlist([]); // guest wishlist is now empty

  return getUserWishlist(userId);
}
