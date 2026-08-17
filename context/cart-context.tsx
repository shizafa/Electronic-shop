"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/context/auth-context";
import * as cartLib from "@/lib/cart";
import type { CartItem } from "@/types/cart";

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  addToCart: (productId: string, variantId: string, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    const currentUserId = user?.id ?? null;
    const justLoggedIn = previousUserId.current === null && currentUserId !== null;

    setItems(
      justLoggedIn ? cartLib.mergeGuestCartIntoUser(currentUserId) : cartLib.getCart(currentUserId)
    );
    previousUserId.current = currentUserId;
  }, [user?.id]);

  function addToCart(productId: string, variantId: string, quantity = 1): void {
    setItems(cartLib.addToCart(user?.id ?? null, productId, variantId, quantity));
  }

  function updateQuantity(variantId: string, quantity: number): void {
    setItems(cartLib.updateCartQuantity(user?.id ?? null, variantId, quantity));
  }

  function removeFromCart(variantId: string): void {
    setItems(cartLib.removeFromCart(user?.id ?? null, variantId));
  }

  function clearCart(): void {
    cartLib.clearCart(user?.id ?? null);
    setItems([]);
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, itemCount, addToCart, updateQuantity, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
