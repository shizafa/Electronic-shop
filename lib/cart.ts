import { readJSON, writeJSON } from "@/lib/storage";
import type { CartItem } from "@/types/cart";

const GUEST_CART_KEY = "electronics_cart_guest";
const userCartKey = (userId: string) => `electronics_cart_${userId}`;

// Picks the right localStorage key: shared guest cart, or a per-user cart
function cartKey(userId: string | null): string {
  return userId ? userCartKey(userId) : GUEST_CART_KEY;
}

// Reads the cart for a logged-in user, or the guest cart if userId is null
export function getCart(userId: string | null): CartItem[] {
  return readJSON<CartItem[]>(cartKey(userId), []);
}

// Adds a variant to the cart, bumping quantity if it's already there
export function addToCart(
  userId: string | null,
  productId: string,
  variantId: string,
  quantity: number
): CartItem[] {
  const items = getCart(userId);
  const existing = items.find((item) => item.variantId === variantId);

  const updatedItems = existing
    ? items.map((item) =>
        item.variantId === variantId ? { ...item, quantity: item.quantity + quantity } : item
      )
    : [...items, { productId, variantId, quantity }];

  writeJSON(cartKey(userId), updatedItems);
  return updatedItems;
}

// Sets a line's quantity directly; a quantity of 0 or less removes the item
export function updateCartQuantity(
  userId: string | null,
  variantId: string,
  quantity: number
): CartItem[] {
  const items = getCart(userId);
  const updatedItems =
    quantity <= 0
      ? items.filter((item) => item.variantId !== variantId)
      : items.map((item) => (item.variantId === variantId ? { ...item, quantity } : item));

  writeJSON(cartKey(userId), updatedItems);
  return updatedItems;
}

// Removes one variant from the cart entirely
export function removeFromCart(userId: string | null, variantId: string): CartItem[] {
  const updatedItems = getCart(userId).filter((item) => item.variantId !== variantId);
  writeJSON(cartKey(userId), updatedItems);
  return updatedItems;
}

// Empties the cart
export function clearCart(userId: string | null): void {
  writeJSON(cartKey(userId), []);
}

// After login, folds items added as a guest into the user's own cart, then clears the guest cart
export function mergeGuestCartIntoUser(userId: string): CartItem[] {
  const guestItems = getCart(null);
  if (guestItems.length === 0) return getCart(userId);

  const merged = [...getCart(userId)];

  for (const guestItem of guestItems) {
    const existing = merged.find((item) => item.variantId === guestItem.variantId);
    if (existing) {
      existing.quantity += guestItem.quantity; // combine quantities for the same variant
    } else {
      merged.push({ ...guestItem });
    }
  }

  writeJSON(cartKey(userId), merged);
  writeJSON(cartKey(null), []); // guest cart is now empty
  return merged;
}