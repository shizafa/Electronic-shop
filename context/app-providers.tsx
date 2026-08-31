"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import { CompareProvider } from "@/context/compare-context";
import { QuickViewProvider } from "@/context/quick-view-context";
import { WishlistProvider } from "@/context/wishlist-context";

// Wraps the app in every global context provider (auth, cart, wishlist, compare, quick view)
// in the right order. ProductCatalogProvider is deliberately NOT global — it fetches the whole
// product catalog client-side, and only cart/wishlist/compare/checkout actually need that, so
// it's mounted per-route instead (see those routes' layout.tsx files) to avoid an unnecessary
// catalog fetch on pages like /about that never touch product data.
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <CompareProvider>
            <QuickViewProvider>{children}</QuickViewProvider>
          </CompareProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
