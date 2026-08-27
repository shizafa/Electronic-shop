"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import { getVariantById } from "@/lib/products";

// Mini-cart quick-access item: item count badge plus running subtotal.
//
// Same subtotal approach as the old header.tsx (which this replaces): fetch prices only
// for the variants actually in the cart, rather than pulling the full catalog just to show
// a number here. CartItem doesn't carry price — it's just {productId, variantId, quantity}.
//
// Split out as its own client leaf so the cart subscription + price effect don't force the
// rest of the main bar to be client-rendered. The template's rbt-cart-sidenav-activation
// class opened a slide-in drawer via JS; no drawer exists yet, so this links straight to
// /cart — the class stays for when that drawer is built.
export function MainBarCartLink() {
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
          <li className="rbt-access-box rbt-scroll-trigger fade_in animation-order-3 rbt-access-box-has-bg-hover rbt-mini-cart">
            <Link href="/cart" className="rbt-access-box-wrapper rbt-cart-sidenav-activation">
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
