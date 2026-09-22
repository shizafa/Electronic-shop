"use client";

import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { useVariantsByIds } from "@/hooks/use-variants-by-ids";
import { formatPrice } from "@/lib/currency";

// Same subtotal approach as main-bar-cart-link.tsx (fetch prices only for variants actually
// in the cart) — duplicated rather than shared, since the two markups differ enough
// (label/price layout) that a shared component would need branching just to re-skin itself.
//
// Click opens CartSideNav (via CartContext's isCartOpen), same as the main bar's cart link;
// href="/cart" stays as a no-JS fallback.
export function StickyHeaderCartLink() {
  const { items, itemCount, openCart } = useCart();
  // subtotal badge only — a failed lookup leaves those prices out; the cart drawer shows the error
  const { variantsById } = useVariantsByIds(items.map((item) => item.variantId));

  const subtotal = items.reduce(
    (sum, item) => sum + (variantsById[item.variantId]?.price ?? 0) * item.quantity,
    0
  );

  return (
          <li className="rbt-access-box rbt-scroll-trigger fade_in animation-order-5 rbt-access-box-has-bg-hover rbt-mini-cart tooltips tooltip-distance-lg" data-tooltip="Cart" data-tooltip-position="bottom">
            <Link
              className="rbt-cart-sidenav-activation"
              href="/cart"
              onClick={(event) => {
                event.preventDefault();
                openCart();
              }}
            >
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
