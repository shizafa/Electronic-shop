"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import { computeOrderTotals, type CommerceSettings } from "@/lib/order-totals";
import { getProductById, getVariantById } from "@/lib/products";
import type { Product, Variant } from "@/types/product";

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
// Still inert: the edit/note/shipping/coupon/share-cart modals (data-bs-toggle, no Bootstrap
// JS loaded per project rules) and the "You May Also Like" swiper recommendations — only cart
// contents/totals and open/close were asked for this turn.
export function CartSideNav({ settings }: { settings: CommerceSettings }) {
  const router = useRouter();
  const { user } = useAuth();
  const { items, isCartOpen, closeCart, updateQuantity, removeFromCart } = useCart();
  const [productsById, setProductsById] = useState<Record<string, Product | null>>({});
  const [variantsById, setVariantsById] = useState<Record<string, Variant | null>>({});

  useEffect(() => {
    const missingProductIds = items.map((item) => item.productId).filter((id) => !(id in productsById));
    const missingVariantIds = items.map((item) => item.variantId).filter((id) => !(id in variantsById));
    if (missingProductIds.length === 0 && missingVariantIds.length === 0) return;

    let active = true;
    Promise.all([
      Promise.all(missingProductIds.map((id) => getProductById(id))),
      Promise.all(missingVariantIds.map((id) => getVariantById(id))),
    ]).then(([products, variants]) => {
      if (!active) return;
      setProductsById((current) => {
        const next = { ...current };
        products.forEach((product, index) => {
          next[missingProductIds[index]] = product ?? null;
        });
        return next;
      });
      setVariantsById((current) => {
        const next = { ...current };
        variants.forEach((variant, index) => {
          next[missingVariantIds[index]] = variant ?? null;
        });
        return next;
      });
    });

    return () => {
      active = false;
    };
  }, [items, productsById, variantsById]);

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
    router.push(user ? "/checkout" : "/login?redirect=/checkout");
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
            <div className="rbt-quick-info-tag d-flex mt--16 rbt-flash-animation">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M18.9706 14.9359C18.8148 18.8649 15.7493 22 11.9891 22C8.12909 22 5 18.5858 5 14.6221C5 14.0924 4.99101 13.0336 5.74352 11.2472C6.19387 10.1781 6.47633 9.50646 6.63574 8.89253C6.72333 8.55511 6.89367 8.01904 7.37926 8.89253C7.66559 9.40757 7.67666 10.1483 7.67666 10.1483C7.67666 10.1483 8.74197 9.28536 9.4611 7.63673C10.5153 5.21985 9.67419 3.77512 9.38675 2.77048C9.28727 2.42294 9.22481 1.79833 9.90721 2.06409C10.6025 2.33495 12.4408 3.69334 13.4017 5.12512C14.7732 7.16855 15.2605 9.128 15.2605 9.128C15.2605 9.128 15.6997 8.55268 15.8553 7.95068C16.0312 7.27089 16.0338 6.59763 16.5988 7.32285C17.1361 8.01253 17.9341 9.3086 18.3833 10.5408C19.1989 12.7784 18.9706 14.9359 18.9706 14.9359Z" fill="url(#paint0_linear_47_2365484)" />
                <path fillRule="evenodd" clipRule="evenodd" d="M11.9999 22C9.23852 22 7 19.7944 7 17.0735C7 15.4318 7.67145 14.435 9.0689 13.0833C9.96366 12.2179 10.8011 11.1549 11.157 10.4311C11.2271 10.2886 11.3866 9.54605 12.0014 10.4155C12.3239 10.8714 12.8296 11.6823 13.1538 12.3744C13.7127 13.5676 13.8461 14.7239 13.8461 14.7239C13.8461 14.7239 14.3938 14.4059 14.7692 13.5871C14.8902 13.3232 15.1348 12.3241 15.8186 13.323C16.3204 14.0561 17.0097 15.3741 16.9999 17.0735C16.9999 19.7944 14.7613 22 11.9999 22Z" fill="#FC9502" />
                <path fillRule="evenodd" clipRule="evenodd" d="M12.1019 16C12.8497 16 12.8497 17.4475 13.7996 19.3803C14.4321 20.6672 13.486 22 12.1019 22C10.7178 22 10 20.8271 10 19.3803C10 17.9335 11.3541 16 12.1019 16Z" fill="#FCE202" />
                <defs>
                  <linearGradient id="paint0_linear_47_2365484" x1="11.9995" y1="22.0148" x2="11.9995" y2="2.01511" gradientUnits="userSpaceOnUse">
                    <stop offset="1" stopColor="#FF4C0D" />
                    <stop offset="1" stopColor="#FC9502" />
                  </linearGradient>
                </defs>
              </svg>
              <p>
                Limited Item,
                <strong>
                  checkout within
                  <span className="rbt-countdown-cart">
                    10m 00s
                  </span>
                </strong>
              </p>
            </div>
            <div className="rbt-btn-close" id="btn_sideNavClose">
              <button type="button" className="minicart-close-button rbt-round-btn" onClick={closeCart}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          </div>
          <nav className="side-nav w-100">
            {isResolving ? (
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
            <div className="minicart-quick-access-area mt--24">
              <a href="#" className="single-quick-access rbt-note-btn">
                <span className="icon">
                  <i className="fa-regular fa-pen" />
                </span>
                <span className="text">
                  Note
                </span>
              </a>
              <span className="hr-sepator" />
              <a href="#" className="single-quick-access rbt-shipping-btn">
                <span className="icon">
                  <i className="fa-regular fa-truck-fast" />
                </span>
                <span className="text">
                  Shipping
                </span>
              </a>
              <span className="hr-sepator" />
              <a href="#" className="single-quick-access rbt-coupon-btn">
                <span className="icon">
                  <i className="fa-regular fa-ticket" />
                </span>
                <span className="text">
                  Coupon
                </span>
              </a>
            </div>
            <div className="minicart-inc-items-area mt--12">
              <h3 className="title h6 positin-top">
                You May Also Like
              </h3>
              <div className="bottom-area">
                <div className="swiper rbt-dot-top-right inc-item-swiper-activation rbt-minicart-wrapper overflow-hidden">
                  <div className="swiper-wrapper">
                    {/* single slide */}
                    <div className="swiper-slide">
                      <div className="minicart-item">
                        <div className="thumbnail">
                          <a href="product-single-default.html">
                            <img src="assets/images/product-img/electronics/electronics-bg-trans-08-a-1-hover.webp" alt="Product Image" />
                          </a>
                        </div>
                        <div className="product-content">
                          <h3 className="title h6">
                            <a href="product-single-default.html">
                              Keurig K-Duo 4K
                                                        Waterproof Action
                                                        Video Camera
                            </a>
                          </h3>
                          <span className="quantity">
                            <span className="price">
                              $345.00
                            </span>
                          </span>
                        </div>
                        <a href="#!" className="add-itembtn tooltips" data-bs-toggle="modal" data-bs-target="#addedcartModal" data-tooltip="Add to Cart">
                          <i className="fa-regular fa-cart-plus" />
                        </a>
                      </div>
                    </div>
                    {/* single slide */}
                    <div className="swiper-slide">
                      <div className="minicart-item">
                        <div className="thumbnail">
                          <a href="product-single-default.html">
                            <img src="assets/images/product-img/electronics/electronics-bg-trans-06-a-1-hover.webp" alt="Product Image" />
                          </a>
                        </div>
                        <div className="product-content">
                          <h3 className="title h6">
                            <a href="product-single-default.html">
                              Full Amoled HD
                                                        Streaming Webcam
                            </a>
                          </h3>
                          <span className="quantity">
                            <span className="price">
                              $189.00
                            </span>
                          </span>
                        </div>
                        <a href="#!" className="add-itembtn tooltips" data-bs-toggle="modal" data-bs-target="#addedcartModal" data-tooltip="Add to Cart">
                          <i className="fa-regular fa-cart-plus" />
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="rbt-swiper-pagination" />
                </div>
              </div>
            </div>
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
      <a href="#!" className="rbt-close-inner-popup rbt-popup-close-btn" />
      <div className="rbt-offcanvas-inner-popup">
        <div className="rbt-offcanvas-inner-popup-card note-popup">
          <div className="rbt-offcanvas-card-inner">
            <h3 className="rbt-title rbt-text-bold h6">
              <span className="mr--4">
                <i className="fa-regular fa-pen" />
              </span>
              Add note for seller
            </h3>
            <form>
              <div className="rbt-input-field-grp mb--12">
                <textarea className="rbt-text-field" name="message" placeholder="Notes about your order, e.g. special notes for delivery." />
              </div>
              <div className="rbt-btn-group mt--16">
                <button className="rbt-btn rbt-btn-md rbt-btn-primary d-block w-100">
                  Apply
                </button>
                <button className="rbt-btn rbt-btn-md rbt-btn-naked d-block w-100 mt--8 mb--8 rbt-popup-close-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="rbt-offcanvas-inner-popup">
        <div className="rbt-offcanvas-inner-popup-card shipping-popup">
          <div className="rbt-offcanvas-card-inner">
            <h3 className="rbt-title rbt-text-bold h6">
              <span className="mr--4">
                <i className="fa-light fa-truck-fast" />
              </span>
              Estimate shipping rates
            </h3>
            <form>
              <div className="rbt-input-field-grp mb--12">
                <div className="rbt-dropdown-select filter-select rbt-modern-select search-by-category">
                  <select className="w-100 rbt-select-activation" data-live-search="true" data-live-search-placeholder="Search City">
                    <option>
                      Select your City
                    </option>
                    <option>
                      New York
                    </option>
                    <option>
                      London
                    </option>
                    <option>
                      Paris
                    </option>
                    <option>
                      Tokyo
                    </option>
                    <option>
                      Dubai
                    </option>
                    <option>
                      Singapore
                    </option>
                    <option>
                      Sydney
                    </option>
                    <option>
                      Berlin
                    </option>
                    <option>
                      Toronto
                    </option>
                    <option>
                      Los Angeles
                    </option>
                  </select>
                </div>
              </div>
              <div className="rbt-input-field-grp mb--12">
                <input type="text" placeholder="State / County" />
              </div>
              <div className="rbt-input-field-grp mb--12">
                <input type="text" placeholder="City" />
              </div>
              <div className="rbt-input-field-grp">
                <input type="text" placeholder="Postcode / ZIP" />
              </div>
              <div className="rbt-btn-group mt--16">
                <button className="rbt-btn rbt-btn-md rbt-btn-primary d-block w-100">
                  Calculate shipping rates
                </button>
                <button className="rbt-btn rbt-btn-md rbt-btn-naked d-block w-100 mt--8 mb--8 rbt-popup-close-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="rbt-offcanvas-inner-popup">
        <div className="rbt-offcanvas-inner-popup-card coupon-popup">
          <div className="rbt-offcanvas-card-inner">
            <h3 className="rbt-title rbt-text-bold h6">
              <span className="mr--4">
                <i className="fa-regular fa-ticket" />
              </span>
              Select or input Coupon
            </h3>
            <div className="rbt-coupon-wrapper rbt-bg-color-white">
              <div className="rbt-coupon">
                <div className="inner rbt-text-copy-activation">
                  <div className="left-part">
                    <input type="text" value="WELCOME100" readOnly={true} className="rbt-coupon-code-text rbt-has-right-shepe-border rbt-copy-value-field" />
                  </div>
                  <div className="coupon-details">
                    <h2 className="rbt-coupon-info-title b1">
                      UP TO 30% OFF
                    </h2>
                    <p className="rbt-coupon-info-sub-title b3 mt--4">
                      For orders over $9.90
                    </p>
                    <ul className="rbt-coupon-info-list mt--12">
                      <li>
                        <span>
                          12/18/2023 14:00 ~ 12/25/2023 14:00
                        </span>
                      </li>
                      <li>
                        <span>
                          The minimum spend for this coupon
                          <strong>
                            $200.00
                          </strong>
                        </span>
                      </li>
                    </ul>
                  </div>
                  <button className="copy-icon rbt-round-btn rbt-bg-primary rbt-copy-btn" data-tooltip="Copy">
                    <i className="fa-sharp fa-regular fa-copy" />
                  </button>
                </div>
              </div>
              <div className="rbt-coupon">
                <div className="inner rbt-text-copy-activation">
                  <div className="left-part">
                    <input type="text" value="WELCOME100" readOnly={true} className="rbt-coupon-code-text rbt-has-right-shepe-border rbt-copy-value-field" />
                  </div>
                  <div className="coupon-details">
                    <h2 className="rbt-coupon-info-title b1">
                      UP TO 30% OFF
                    </h2>
                    <p className="rbt-coupon-info-sub-title b3 mt--4">
                      For orders over $9.90
                    </p>
                    <ul className="rbt-coupon-info-list mt--12">
                      <li>
                        <span>
                          12/18/2023 14:00 ~ 12/25/2023 14:00
                        </span>
                      </li>
                      <li>
                        <span>
                          The minimum spend for this coupon
                          <strong>
                            $200.00
                          </strong>
                        </span>
                      </li>
                    </ul>
                  </div>
                  <button className="copy-icon rbt-round-btn rbt-bg-primary rbt-copy-btn" data-tooltip="Copy">
                    <i className="fa-sharp fa-regular fa-copy" />
                  </button>
                </div>
              </div>
            </div>
            <form>
              <div className="rbt-input-field-grp mt--24">
                <p className="b1 mb--12 rbt-text-color-gray-600">
                  If you have coupon code, please apply it below.
                </p>
                <input type="text" placeholder="Coupon code" />
              </div>
              <div className="rbt-btn-group mt--16">
                <button className="rbt-btn rbt-btn-md rbt-btn-primary d-block w-100">
                  Apply
                </button>
                <button className="rbt-btn rbt-btn-md rbt-btn-naked d-block w-100 mt--8 mb--8 rbt-popup-close-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
