"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import { CompareProvider } from "@/context/compare-context";
import { WishlistProvider } from "@/context/wishlist-context";

// Wraps the app in every global context provider (auth, cart, wishlist, compare) in the right order
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <CompareProvider>{children}</CompareProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}