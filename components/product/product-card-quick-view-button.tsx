"use client";

import { type MouseEvent } from "react";
import { useQuickView } from "@/context/quick-view-context";
import type { Product } from "@/types/product";

interface ProductCardQuickViewButtonProps {
  product: Product;
  categoryName?: string;
  categorySlug?: string;
}

// Just the Quick View button out of .rbt-quick-btn-grp — same split reasoning as
// ProductCardWishlistButton beside it (own subtree, own re-render scope). Was server-rendered
// with no handler until quick-view/quick-view.tsx existed to open.
export function ProductCardQuickViewButton({ product, categoryName, categorySlug }: ProductCardQuickViewButtonProps) {
  const { openQuickView } = useQuickView();

  function handleClick(event: MouseEvent) {
    event.preventDefault();
    openQuickView({ product, categoryName, categorySlug });
  }

  return (
    <button
      className="rbt-search-btn rbt-quick-btn tooltips"
      type="button"
      onClick={handleClick}
      aria-label="Quick View"
      data-tooltip="Quick View"
      data-tooltip-position="left"
    >
      <i className="fa-regular fa-magnifying-glass-plus" />
    </button>
  );
}
