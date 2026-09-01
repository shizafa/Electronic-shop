"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import type { Product, Variant } from "@/types/product";

interface CheckoutSidebarProps {
  lineItems: { product: Product; variant: Variant; quantity: number }[];
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
}

// CheckoutSidebar — order summary shown alongside the checkout steps (checkout-delivery-step-one.html's
// sidebar). The free-shipping progress bar is dropped: shipping is already always free
// (shippingFee is hardcoded to 0 in checkout-flow.tsx), so a "spend more to unlock free shipping"
// bar would be actively misleading. The rewards-points sign-in prompt is dropped too: this page is
// only reachable while logged in (checkout-flow.tsx redirects to /login otherwise), so a "sign in to
// unlock points" prompt can never legitimately show here — and there's no points system regardless.
// Share Cart is kept as an inert button, matching the same button in cart-side-nav.tsx (no Bootstrap
// modal JS is loaded, so it does nothing on click there either).
export function CheckoutSidebar({ lineItems, subtotal, shippingFee, taxAmount, total }: CheckoutSidebarProps) {
  const { openCart } = useCart();
  const visibleItems = lineItems.slice(0, 3);
  const extraCount = lineItems.length - visibleItems.length;

  return (
    <div className="col-12 col-md-12 col-lg-4 mt--24">
      <div className="rbt-sidebar-cart sticky-top">
        {/* Start Single Widget */}
        <div className="rbt-sidebar-widget">
          <div className="rbt-inner">
            <div className="rbt-title-part d-flex mb--12 justify-content-between align-items-center">
              <h3 className="title h5 mb--0 rbt-text-bold">
                Order summary
              </h3>
              <div className="rbt-link-hover">
                <Link href="/cart">
                  Edit
                </Link>
              </div>
            </div>
            <div className="rbt-order-sum-area rbt-order-sum-area-sm align-items-center mb--16">
              <Link
                href="/cart"
                className="ordered-items-wrapper rbt-order-sidenav-activation d-flex rbt-gap--12 align-items-center"
                onClick={(event) => {
                  event.preventDefault();
                  openCart();
                }}
              >
                {visibleItems.map(({ product, variant }) => {
                  const image = variant.images?.[0] ?? product.images[0];
                  return (
                    <div className="ordered-item ordered-item-01" key={variant.id}>
                      {image && <Image src={image} alt={product.name} width={68} height={68} />}
                    </div>
                  );
                })}
                {extraCount > 0 && (
                  <div className="ordered-item more-icon ms-auto">
                    <i className="fa-solid fa-chevron-right" />
                  </div>
                )}
              </Link>
            </div>
            <div className="rbt-cart-subttotal">
              <p>
                {t("common.subtotal")} ({lineItems.length} items)
              </p>
              <p className="price">
                {formatPrice(subtotal)}
              </p>
            </div>
            <div className="rbt-cart-subttotal">
              <p>
                {t("common.shippingFee")}
              </p>
              <p className="price">
                {shippingFee === 0 ? t("common.free") : formatPrice(shippingFee)}
              </p>
            </div>
            {taxAmount > 0 && (
              <div className="rbt-cart-subttotal">
                <p>
                  {t("common.tax")}
                </p>
                <p className="price">
                  {formatPrice(taxAmount)}
                </p>
              </div>
            )}
            <hr className="mb--8 mt--8 rbt-bg-color-gray-200" />
            <div className="rbt-cart-subttotal mb--12">
              <p className="subtotal">
                <strong>
                  {t("common.total")}
                </strong>
              </p>
              <p className="price">
                {formatPrice(total)}
              </p>
            </div>
            <div className="rbt-minicart-bottom mt--24">
              <div className="share-btn-grp rbt-link-hover">
                <Link href="/cart" className="share-btn">
                  <i className="fa-regular fa-pen mr--4" />
                  View Cart
                </Link>
                <button data-bs-toggle="modal" data-bs-target="#socialShareModal" type="button" className="share-btn">
                  <i className="fa-sharp fa-solid fa-link mr--4" />
                  Share
                  Cart
                </button>
              </div>
              <ul className="rbt-cart-brand-list mt--24">
                <li>
                  <a href="#!">
                    <img src="/assets/images/payment-brand/image-01.webp" alt="eCommerce Brand Image" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* End Single Widget */}
      </div>
    </div>
  );
}
