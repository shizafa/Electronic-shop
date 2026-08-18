import { createClient } from "@/lib/supabase/client";
import { readJSON, writeJSON } from "@/lib/storage";
import type { CartItem } from "@/types/cart";

const GUEST_CART_KEY = "electronics_cart_guest";

function getGuestCart(): CartItem[] {
  return readJSON<CartItem[]>(GUEST_CART_KEY, []);
}

function writeGuestCart(items: CartItem[]): void {
  writeJSON(GUEST_CART_KEY, items);
}

interface CartItemRow {
  product_id: string;
  variant_id: string;
  quantity: number;
}

function mapCartItemRow(row: CartItemRow): CartItem {
  return { productId: row.product_id, variantId: row.variant_id, quantity: row.quantity };
}

async function getUserCart(userId: string): Promise<CartItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("cart_items")
    .select("product_id, variant_id, quantity")
    .eq("user_id", userId);
  if (error) {
    console.error("getUserCart failed", error);
    return [];
  }
  return (data ?? []).map(mapCartItemRow);
}

// Reads the cart for a logged-in user, or the guest cart if userId is null
export async function getCart(userId: string | null): Promise<CartItem[]> {
  return userId ? getUserCart(userId) : getGuestCart();
}

// Adds a variant to the cart, bumping quantity if it's already there
export async function addToCart(
  userId: string | null,
  productId: string,
  variantId: string,
  quantity: number
): Promise<CartItem[]> {
  if (!userId) {
    const items = getGuestCart();
    const existing = items.find((item) => item.variantId === variantId);
    const updatedItems = existing
      ? items.map((item) =>
          item.variantId === variantId ? { ...item, quantity: item.quantity + quantity } : item
        )
      : [...items, { productId, variantId, quantity }];
    writeGuestCart(updatedItems);
    return updatedItems;
  }

  const supabase = createClient();
  const existing = (await getUserCart(userId)).find((item) => item.variantId === variantId);
  const nextQuantity = existing ? existing.quantity + quantity : quantity;

  const { error } = await supabase
    .from("cart_items")
    .upsert(
      { user_id: userId, variant_id: variantId, product_id: productId, quantity: nextQuantity },
      { onConflict: "user_id,variant_id" }
    );
  if (error) console.error("addToCart failed", error);

  return getUserCart(userId);
}

// Sets a line's quantity directly; a quantity of 0 or less removes the item
export async function updateCartQuantity(
  userId: string | null,
  variantId: string,
  quantity: number
): Promise<CartItem[]> {
  if (!userId) {
    const items = getGuestCart();
    const updatedItems =
      quantity <= 0
        ? items.filter((item) => item.variantId !== variantId)
        : items.map((item) => (item.variantId === variantId ? { ...item, quantity } : item));
    writeGuestCart(updatedItems);
    return updatedItems;
  }

  const supabase = createClient();
  if (quantity <= 0) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId)
      .eq("variant_id", variantId);
    if (error) console.error("updateCartQuantity (delete) failed", error);
  } else {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("user_id", userId)
      .eq("variant_id", variantId);
    if (error) console.error("updateCartQuantity failed", error);
  }

  return getUserCart(userId);
}

// Removes one variant from the cart entirely
export async function removeFromCart(userId: string | null, variantId: string): Promise<CartItem[]> {
  if (!userId) {
    const updatedItems = getGuestCart().filter((item) => item.variantId !== variantId);
    writeGuestCart(updatedItems);
    return updatedItems;
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("variant_id", variantId);
  if (error) console.error("removeFromCart failed", error);

  return getUserCart(userId);
}

// Empties the cart
export async function clearCart(userId: string | null): Promise<void> {
  if (!userId) {
    writeGuestCart([]);
    return;
  }

  const supabase = createClient();
  const { error } = await supabase.from("cart_items").delete().eq("user_id", userId);
  if (error) console.error("clearCart failed", error);
}

// After login, folds items added as a guest into the user's own cart, then clears the guest cart
export async function mergeGuestCartIntoUser(userId: string): Promise<CartItem[]> {
  const guestItems = getGuestCart();
  if (guestItems.length === 0) return getUserCart(userId);

  const supabase = createClient();
  const userItems = await getUserCart(userId);

  const merged = new Map<string, CartItem>();
  for (const item of userItems) merged.set(item.variantId, { ...item });
  for (const guestItem of guestItems) {
    const existing = merged.get(guestItem.variantId);
    if (existing) {
      existing.quantity += guestItem.quantity; // combine quantities for the same variant
    } else {
      merged.set(guestItem.variantId, { ...guestItem });
    }
  }

  const rows = Array.from(merged.values()).map((item) => ({
    user_id: userId,
    variant_id: item.variantId,
    product_id: item.productId,
    quantity: item.quantity,
  }));

  const { error } = await supabase
    .from("cart_items")
    .upsert(rows, { onConflict: "user_id,variant_id" });
  if (error) console.error("mergeGuestCartIntoUser failed", error);

  writeGuestCart([]); // guest cart is now empty

  return getUserCart(userId);
}
