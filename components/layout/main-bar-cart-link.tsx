"use client";

import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { useVariantsByIds } from "@/hooks/use-variants-by-ids";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";

// Mini-cart quick-access item: item count badge plus running subtotal.
//
// Same subtotal approach as the old header.tsx (which this replaces): fetch prices only
// for the variants actually in the cart, rather than pulling the full catalog just to show
// a number here. CartItem doesn't carry price — it's just {productId, variantId, quantity}.
//
// Split out as its own client leaf so the cart subscription + price effect don't force the
// rest of the main bar to be client-rendered. Click opens CartSideNav (via CartContext's
// isCartOpen) instead of navigating — href="/cart" stays as a no-JS fallback.
export function MainBarCartLink() {
  const { items, itemCount, openCart } = useCart();
  // subtotal badge only — a failed lookup leaves those prices out; the cart drawer shows the error
  const { variantsById } = useVariantsByIds(items.map((item) => item.variantId));

  const subtotal = items.reduce(
    (sum, item) => sum + (variantsById[item.variantId]?.price ?? 0) * item.quantity,
    0
  );

  return (
          <li className="rbt-access-box rbt-scroll-trigger fade_in animation-order-3 rbt-access-box-has-bg-hover rbt-mini-cart">
            <Link
              href="/cart"
              className="rbt-access-box-wrapper rbt-cart-sidenav-activation"
              onClick={(event) => {
                event.preventDefault();
                openCart();
              }}
            >
              <div className="rbt-round-btn rbt-bg-static-gray">
                <i className="fa-regular fa-bag-shopping" />
                {itemCount > 0 && (
                  <span className="access-box-count rbt-shiny">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="content p-0">
                <p>
                  {t("nav.cart")}
                </p>
                <span>
                  {formatPrice(subtotal)}
                </span>
              </div>
            </Link>
          </li>
  );
}
