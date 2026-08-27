"use client";

import { type MouseEvent } from "react";
import { useCart } from "@/context/cart-context";
import { useCompare } from "@/context/compare-context";
import { t } from "@/lib/i18n";

interface ProductCardActionsProps {
  productId: string;
  variantId: string;
  categoryId: string;
  isOutOfStock: boolean;
}

// The card's cart/compare button group.
//
// Why this is split out of ProductCard: the point is re-render scope, not bundle size. Most
// of ProductCard's callers are already client components, so the card ships to the browser
// either way. What changed is that the cart and compare context subscriptions now live on
// this leaf — before, every card in a grid subscribed to all three contexts, so a single
// cart update re-rendered every full card (images, spec lists and all). Now it re-renders
// just these two buttons.
export function ProductCardActions({ productId, variantId, categoryId, isOutOfStock }: ProductCardActionsProps) {
  const { addToCart } = useCart();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const inCompare = isInCompare(productId);

  function handleCompareToggle(event: MouseEvent) {
    event.preventDefault();
    if (inCompare) {
      removeFromCompare(productId);
    } else {
      // addToCompare shows a toast itself if the 4-item cap is hit or the
      // product is from a different category than what's already compared.
      addToCompare(productId, categoryId);
    }
  }

  function handleAddToCart(event: MouseEvent) {
    event.preventDefault();
    if (isOutOfStock) return;
    addToCart(productId, variantId);
  }

  return (
        <div className="prd-btn-grp">
          <a className={`rbt-btn rbt-btn-border rbt-btn-sm rbt-square-btn d-block has-left-icon rbt-cart-sidenav-activation${isOutOfStock ? " disabled" : ""}`} href="#" onClick={handleAddToCart}>
            <i className="fa-regular fa-cart-shopping" />
            {t("common.addToCart")}
          </a>
          <a className="rbt-btn rbt-btn-border rbt-btn-sm rbt-square-btn d-block rbt-btn-transparent has-left-icon rbt-compare-btn-activation" href="#" onClick={handleCompareToggle}>
            <i className="fa-regular fa-file-plus-minus" />
            {inCompare ? t("common.removeFromCompare") : t("common.addToCompare")}
          </a>
        </div>
  );
}
