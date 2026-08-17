import { readJSON, writeJSON } from "@/lib/storage";
import type { CartItem } from "@/types/cart";

const GUEST_CART_KEY = "electronics_cart_guest";
const userCartKey = (userId: string) => `electronics_cart_${userId}`;

function cartKey(userId: string | null): string {
  return userId ? userCartKey(userId) : GUEST_CART_KEY;
}

export function getCart(userId: string | null): CartItem[] {
  return readJSON<CartItem[]>(cartKey(userId), []);
}

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

export function removeFromCart(userId: string | null, variantId: string): CartItem[] {
  const updatedItems = getCart(userId).filter((item) => item.variantId !== variantId);
  writeJSON(cartKey(userId), updatedItems);
  return updatedItems;
}

export function clearCart(userId: string | null): void {
  writeJSON(cartKey(userId), []);
}

export function mergeGuestCartIntoUser(userId: string): CartItem[] {
  const guestItems = getCart(null);
  if (guestItems.length === 0) return getCart(userId);

  const merged = [...getCart(userId)];

  for (const guestItem of guestItems) {
    const existing = merged.find((item) => item.variantId === guestItem.variantId);
    if (existing) {
      existing.quantity += guestItem.quantity;
    } else {
      merged.push({ ...guestItem });
    }
  }

  writeJSON(cartKey(userId), merged);
  writeJSON(cartKey(null), []);
  return merged;
}