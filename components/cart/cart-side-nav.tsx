"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useVariantsByIds } from "@/hooks/use-variants-by-ids";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import { computeOrderTotals, type CommerceSettings } from "@/lib/order-totals";
import { getProductById } from "@/lib/products";
import type { Product } from "@/types/product";

// Slide-in cart drawer, opened by the header's cart icon (rbt-cart-sidenav-activation in
// main-bar-cart-link.tsx / sticky-header-cart-link.tsx) via CartContext's isCartOpen.
// style.min.css toggles visibility with the "side-menu-active" class appended to
// .rbt-cart-side-menu itself (no backdrop/overlay element in the template markup). The page
// behind it gets blurred via a body:has() rule in site-overrides.css, same treatment as the
// megamenu's background blur.
//
// Resolves cart line items itself (product + variant lookups by id, same pattern as
// main-bar-cart-link.tsx's price fetch) rather than useProductCatalog — this drawer mounts on
// every storefront page via app/(site)/layout.tsx, and useProductCatalog fetches the *whole*
// catalog, which product-catalog-context.tsx deliberately keeps scoped to cart/wishlist/
// compare/checkout only.
//
// Still inert: the edit/share-cart modals (data-bs-toggle, no Bootstrap JS loaded per project
// rules) — only cart contents/totals and open/close were asked for this turn. The template's
// Note/Shipping/Coupon quick-access buttons (and their inner popups) and the "You May Also
// Like" swiper were removed on request.
export function CartSideNav({ settings }: { settings: CommerceSettings }) {
  const router = useRouter();
  const { user } = useAuth();
  const { items, isCartOpen, closeCart, updateQuantity, removeFromCart } = useCart();
  const [productsById, setProductsById] = useState<Record<string, Product | null>>({});
  const [productsError, setProductsError] = useState(false);
  const { variantsById, hasError: variantsError } = useVariantsByIds(items.map((item) => item.variantId));
  const loadError = productsError || variantsError;

  useEffect(() => {
    const missingProductIds = items.map((item) => item.productId).filter((id) => !(id in productsById));
    if (missingProductIds.length === 0) return;

    let active = true;
    Promise.all(missingProductIds.map((id) => getProductById(id))).then((products) => {
      if (!active) return;
      setProductsError(false);
      setProductsById((current) => {
        const next = { ...current };
        products.forEach((product, index) => {
          next[missingProductIds[index]] = product ?? null;
        });
        return next;
      });
    }).catch((error) => {
      console.error(error);
      if (active) setProductsError(true);
    });

    return () => {
      active = false;
    };
  }, [items, productsById]);

  // Drops any line whose product/variant no longer exists in the catalog (deleted since being
  // added to the cart)
  const lineItems = items
    .map((item) => {
      const product = productsById[item.productId];
      const variant = variantsById[item.variantId];
      if (!product || !variant) return null;
      return { item, product, variant };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  // A cart item is "still resolving" while its id hasn't come back from the effect above yet
  const isResolving = items.some(
    (item) => !(item.productId in productsById) || !(item.variantId in variantsById)
  );

  const itemCount = lineItems.reduce((sum, { item }) => sum + item.quantity, 0);
  const subtotal = lineItems.reduce((sum, { item, variant }) => sum + variant.price * item.quantity, 0);
  const totals = computeOrderTotals(subtotal, settings);

  function handleCheckout() {
    closeCart();
    router.push(user ? "/checkout" : "/login?next=/checkout");
  }

  return (
    <div className={`rbt-cart-side-menu rbt-sidebar-cart${isCartOpen ? " side-menu-active" : ""}`}>
      <div className="inner-wrapper">
        <div className="inner-top">
          <div className="rbt-cart-header">
            <div className="title-section">
              <h2 className="title mb--0 h6">
                <i className="fa-sharp fa-regular fa-cart-shopping mr--12" />
                Your cart
              </h2>
            </div>
            <div className="rbt-btn-close" id="btn_sideNavClose">
              <button type="button" className="minicart-close-button rbt-round-btn" onClick={closeCart}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          </div>
          <nav className="side-nav w-100">
            {loadError ? (
              <p className="mt--16">{t("common.loadFailed")}</p>
            ) : isResolving ? (
              <p className="mt--16">{t("common.loading")}</p>
            ) : lineItems.length === 0 ? (
              <p className="mt--16">{t("cart.empty")}</p>
            ) : (
              <ul className="rbt-minicart-wrapper">
                {lineItems.map(({ item, product, variant }) => (
                  <li key={item.variantId} className="minicart-item">
                    <div className="thumbnail">
                      <Link href={`/product/${product.slug}`} onClick={closeCart}>
                        <Image
                          src={variant.images?.[0] ?? product.images[0]}
                          alt={product.name}
                          width={80}
                          height={60}
                        />
                      </Link>
                    </div>
                    <div className="product-content">
                      <h3 className="title h6">
                        <Link href={`/product/${product.slug}`} onClick={closeCart}>
                          {product.name}
                        </Link>
                      </h3>
                      <span className="quantity">
                        {item.quantity}x
                        <span className="price">
                          {formatPrice(variant.price)}
                        </span>
                      </span>
                      <div className="bottom-part">
                        <div className="rbt-qty-area">
                          <button
                            className="qty-item-btn qty-item-btn-decr"
                            type="button"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          >
                            <i className="fa-solid fa-minus" />
                          </button>
                          <input type="number" className="items-qty-input" value={item.quantity} min="1" readOnly />
                          <button
                            className="qty-item-btn qty-item-btn-incr"
                            type="button"
                            disabled={item.quantity >= variant.stock}
                            onClick={() => updateQuantity(item.variantId, Math.min(variant.stock, item.quantity + 1))}
                          >
                            <i className="fa-solid fa-plus" />
                          </button>
                        </div>
                        <button className="edit-btn" type="button" data-bs-toggle="modal" data-bs-target="#quickviewEditCartModal">
                          <i className="fa-regular fa-pen" />
                          Edit
                        </button>
                      </div>
                    </div>
                    <div className="close-btn">
                      <button className="rbt-round-btn" type="button" onClick={() => removeFromCart(item.variantId)}>
                        <i className="fa-solid fa-xmark" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </div>
        {lineItems.length > 0 && (
          <div className="rbt-minicart-footer">
            <hr className="mb--0 mt--16" />
            <div className="rbt-cart-subttotal">
              <p>
                Subtotal ({itemCount} items)
              </p>
              <p className="price">
                {formatPrice(subtotal)}
              </p>
            </div>
            <div className="rbt-cart-subttotal">
              <p>
                Shipping
              </p>
              <p className="price">
                {totals.shippingFee === 0 ? t("common.free") : formatPrice(totals.shippingFee)}
              </p>
            </div>
            {totals.taxAmount > 0 && (
              <div className="rbt-cart-subttotal">
                <p>
                  {t("common.tax")}
                </p>
                <p className="price">
                  {formatPrice(totals.taxAmount)}
                </p>
              </div>
            )}
            <hr className="mb--0" />
            <div className="rbt-cart-subttotal">
              <p className="subtotal">
                <strong>
                  Total
                </strong>
              </p>
              <p className="price">
                {formatPrice(totals.total)}
              </p>
            </div>
            <div className="rbt-minicart-bottom mt--24">
              <div className="checkout-btn mt--20">
                <button type="button" className="rbt-btn w-100 text-center" onClick={handleCheckout}>
                  <span className="btn-text">
                    Checkout
                  </span>
                </button>
              </div>
              <div className="share-btn-grp rbt-link-hover">
                <Link href="/cart" className="share-btn" onClick={closeCart}>
                  <i className="fa-regular fa-pen mr--4" />
                  View Cart
                </Link>
                <button data-bs-toggle="modal" data-bs-target="#socialShareModal" type="button" className="share-btn">
                  <i className="fa-sharp fa-solid fa-link mr--4" />
                  Share Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
