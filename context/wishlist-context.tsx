"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/context/auth-context";
import * as wishlistLib from "@/lib/wishlist";
import type { WishlistItem } from "@/types/cart";

interface WishlistContextValue {
  items: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (item: WishlistItem) => void;
  isInWishlist: (productId: string, variantId?: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    const currentUserId = user?.id ?? null;
    const justLoggedIn = previousUserId.current === null && currentUserId !== null;

    setItems(
      justLoggedIn
        ? wishlistLib.mergeGuestWishlistIntoUser(currentUserId)
        : wishlistLib.getWishlist(currentUserId)
    );
    previousUserId.current = currentUserId;
  }, [user?.id]);

  function addToWishlist(item: WishlistItem): void {
    setItems(wishlistLib.addToWishlist(user?.id ?? null, item));
  }

  function removeFromWishlist(item: WishlistItem): void {
    setItems(wishlistLib.removeFromWishlist(user?.id ?? null, item));
  }

  function isInWishlist(productId: string, variantId?: string): boolean {
    return items.some((item) => item.productId === productId && item.variantId === variantId);
  }

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
  return context;
}