"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import { CompareProvider } from "@/context/compare-context";
import { WishlistProvider } from "@/context/wishlist-context";

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