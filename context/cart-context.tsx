"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import * as cartLib from "@/lib/cart";
import { t } from "@/lib/i18n";
import type { CartItem } from "@/types/cart";

// Shape of the cart data and actions exposed to the rest of the app
interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  addToCart: (productId: string, variantId: string, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

// Tracks the cart (guest or per-user) in state and syncs it to localStorage (guest) or
// Supabase (logged in) via lib/cart
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    const currentUserId = user?.id ?? null;
    // Detect the guest-to-logged-in transition so the guest cart gets merged in exactly once
    const justLoggedIn = previousUserId.current === null && currentUserId !== null;
    previousUserId.current = currentUserId;

    let active = true;
    const load = justLoggedIn
      ? cartLib.mergeGuestCartIntoUser(currentUserId as string)
      : cartLib.getCart(currentUserId);
    load.then((loadedItems) => {
      if (active) setItems(loadedItems);
    });

    return () => {
      active = false;
    };
  }, [user?.id]);

  // Applies the change to local state immediately (so buttons feel instant), then confirms
  // against the backend and reconciles state with whatever it actually persisted.
  function addToCart(productId: string, variantId: string, quantity = 1): void {
    setItems((current) => {
      const existing = current.find((item) => item.variantId === variantId);
      return existing
        ? current.map((item) =>
            item.variantId === variantId ? { ...item, quantity: item.quantity + quantity } : item
          )
        : [...current, { productId, variantId, quantity }];
    });
    cartLib.addToCart(user?.id ?? null, productId, variantId, quantity).then(setItems);
    toast.success(t("toast.addedToCart"));
  }

  function updateQuantity(variantId: string, quantity: number): void {
    setItems((current) =>
      quantity <= 0
        ? current.filter((item) => item.variantId !== variantId)
        : current.map((item) => (item.variantId === variantId ? { ...item, quantity } : item))
    );
    cartLib.updateCartQuantity(user?.id ?? null, variantId, quantity).then(setItems);
  }

  function removeFromCart(variantId: string): void {
    setItems((current) => current.filter((item) => item.variantId !== variantId));
    cartLib.removeFromCart(user?.id ?? null, variantId).then(setItems);
  }

  function clearCart(): void {
    setItems([]);
    cartLib.clearCart(user?.id ?? null);
  }

  // Total number of units across all lines (not number of distinct lines)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, itemCount, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook to access cart state/actions from any component inside CartProvider
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
