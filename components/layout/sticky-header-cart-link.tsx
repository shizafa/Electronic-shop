"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/currency";
import { getVariantById } from "@/lib/products";

// Same subtotal approach as main-bar-cart-link.tsx (fetch prices only for variants actually
// in the cart) — duplicated rather than shared, since the two markups differ enough
// (label/price layout) that a shared component would need branching just to re-skin itself.
//
// rbt-cart-sidenav-activation kept (no drawer yet, same as the main bar); links to /cart.
export function StickyHeaderCartLink() {
  const { items, itemCount } = useCart();
  const [variantPrices, setVariantPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const missingIds = items.map((item) => item.variantId).filter((id) => !(id in variantPrices));
    if (missingIds.length === 0) return;

    let active = true;
    Promise.all(missingIds.map((id) => getVariantById(id))).then((variants) => {
      if (!active) return;
      setVariantPrices((current) => {
        const next = { ...current };
        variants.forEach((variant, index) => {
          if (variant) next[missingIds[index]] = variant.price;
        });
        return next;
      });
    });

    return () => {
      active = false;
    };
  }, [items, variantPrices]);

  const subtotal = items.reduce((sum, item) => sum + (variantPrices[item.variantId] ?? 0) * item.quantity, 0);

  return (
          <li className="rbt-access-box rbt-scroll-trigger fade_in animation-order-5 rbt-access-box-has-bg-hover rbt-mini-cart tooltips tooltip-distance-lg" data-tooltip="Cart" data-tooltip-position="bottom">
            <Link className="rbt-cart-sidenav-activation" href="/cart">
              <span className="rbt-round-btn has-rbt-md-fsize">
                <i className="fa-regular fa-bag-shopping" />
                {itemCount > 0 && (
                  <span className="access-box-count rbt-shiny">
                    {itemCount}
                  </span>
                )}
              </span>
              <div className="content ml--4">
                <span className="title-text">
                  {formatPrice(subtotal)}
                </span>
              </div>
            </Link>
          </li>
  );
}
