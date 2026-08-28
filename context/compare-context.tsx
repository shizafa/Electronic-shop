"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import * as compareLib from "@/lib/compare";
import type { AddToCompareResult } from "@/lib/compare";
import { t } from "@/lib/i18n";
import type { CompareItem } from "@/types/cart";

// Shape of the compare-list data and actions exposed to the rest of the app
interface CompareContextValue {
  items: CompareItem[];
  addToCompare: (productId: string, categoryId: string) => AddToCompareResult;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  isCompareModalOpen: boolean;
  openCompareModal: () => void;
  closeCompareModal: () => void;
}

const CompareContext = createContext<CompareContextValue | undefined>(undefined);

// Tracks the product-comparison list in state and syncs it to localStorage via lib/compare
export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    // localStorage doesn't exist during SSR, so state must start empty on both
    // server and first client render, then update post-hydration to avoid a mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(compareLib.getCompareList());
  }, []);

  // Tries to add a product; may fail if the list is full or categories don't match
  function addToCompare(productId: string, categoryId: string): AddToCompareResult {
    const alreadyPresent = items.some((item) => item.productId === productId);
    const result = compareLib.addToCompare(productId, categoryId);
    setItems(result.items);

    if (result.success) {
      if (!alreadyPresent) toast.success(t("toast.addedToCompare"));
    } else if (result.reason === "limit_reached") {
      toast.error(t("toast.compareLimitReached"));
    } else {
      toast.error(t("toast.compareDifferentCategory"));
    }

    return result;
  }

  function removeFromCompare(productId: string): void {
    setItems(compareLib.removeFromCompare(productId));
  }

  function clearCompare(): void {
    compareLib.clearCompare();
    setItems([]);
  }

  function isInCompare(productId: string): boolean {
    return items.some((item) => item.productId === productId);
  }

  return (
    <CompareContext.Provider
      value={{
        items,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        isCompareModalOpen,
        openCompareModal: () => setIsCompareModalOpen(true),
        closeCompareModal: () => setIsCompareModalOpen(false),
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

// Hook to access compare-list state/actions from any component inside CompareProvider
export function useCompare(): CompareContextValue {
  const context = useContext(CompareContext);
  if (!context) throw new Error("useCompare must be used within a CompareProvider");
  return context;
}
