"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import * as wishlistLib from "@/lib/wishlist";
import { isSameItem } from "@/lib/wishlist";
import { t } from "@/lib/i18n";
import type { WishlistItem } from "@/types/cart";

// Shape of the wishlist data and actions exposed to the rest of the app
interface WishlistContextValue {
  items: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (item: WishlistItem) => void;
  isInWishlist: (productId: string, variantId?: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

// Tracks the wishlist (guest or per-user) in state and syncs it to localStorage (guest) or
// Supabase (logged in) via lib/wishlist
export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    const currentUserId = user?.id ?? null;
    // Detect the guest-to-logged-in transition so the guest wishlist gets merged in exactly once
    const justLoggedIn = previousUserId.current === null && currentUserId !== null;
    previousUserId.current = currentUserId;

    let active = true;
    const load = justLoggedIn
      ? wishlistLib.mergeGuestWishlistIntoUser(currentUserId as string)
      : wishlistLib.getWishlist(currentUserId);
    load.then((loadedItems) => {
      if (active) setItems(loadedItems);
    });

    return () => {
      active = false;
    };
  }, [user?.id]);

  // Applies the change to local state immediately (so buttons feel instant), then confirms
  // against the backend and reconciles state with whatever it actually persisted.
  function addToWishlist(item: WishlistItem): void {
    const alreadyPresent = items.some((existing) => isSameItem(existing, item));
    setItems((current) => (current.some((existing) => isSameItem(existing, item)) ? current : [...current, item]));
    wishlistLib.addToWishlist(user?.id ?? null, item).then(setItems);
    if (!alreadyPresent) toast.success(t("toast.addedToWishlist"));
  }

  function removeFromWishlist(item: WishlistItem): void {
    setItems((current) => current.filter((existing) => !isSameItem(existing, item)));
    wishlistLib.removeFromWishlist(user?.id ?? null, item).then(setItems);
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

// Hook to access wishlist state/actions from any component inside WishlistProvider
export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
  return context;
}
