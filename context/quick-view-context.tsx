"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Product } from "@/types/product";

// What ProductCard already has in hand when the shopper clicks its Quick View button — no
// extra fetch needed, unlike CompareModal/WishlistModal which resolve products by id because
// their items are id lists persisted to localStorage.
interface QuickViewEntry {
  product: Product;
  categoryName?: string;
  categorySlug?: string;
}

interface QuickViewContextValue {
  entry: QuickViewEntry | null;
  isQuickViewModalOpen: boolean;
  openQuickView: (entry: QuickViewEntry) => void;
  closeQuickViewModal: () => void;
}

const QuickViewContext = createContext<QuickViewContextValue | undefined>(undefined);

// Tracks which product's Quick View modal (if any) is open. Same shape as CompareContext's
// isCompareModalOpen/openCompareModal/closeCompareModal, minus persistence — Quick View has
// nothing to save across page loads.
export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [entry, setEntry] = useState<QuickViewEntry | null>(null);
  const [isQuickViewModalOpen, setIsQuickViewModalOpen] = useState(false);

  function openQuickView(nextEntry: QuickViewEntry) {
    setEntry(nextEntry);
    setIsQuickViewModalOpen(true);
  }

  function closeQuickViewModal() {
    setIsQuickViewModalOpen(false);
  }

  return (
    <QuickViewContext.Provider value={{ entry, isQuickViewModalOpen, openQuickView, closeQuickViewModal }}>
      {children}
    </QuickViewContext.Provider>
  );
}

// Hook to access Quick View state/actions from any component inside QuickViewProvider
export function useQuickView(): QuickViewContextValue {
  const context = useContext(QuickViewContext);
  if (!context) throw new Error("useQuickView must be used within a QuickViewProvider");
  return context;
}
