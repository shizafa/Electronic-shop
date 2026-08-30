"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useProductCatalog } from "@/context/product-catalog-context";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import { getOrderById } from "@/lib/orders";
import { getDisplayVariant } from "@/lib/product-helpers";
import type { Order } from "@/types/order";

// Demo card images in thank-you.tsx carry no explicit width/height; reusing product-card.tsx's
// real intrinsic dimensions for the template's `.rbt-card-img a img{width:100%;object-fit:cover}`
// rule keeps the same aspect-lock reasoning without duplicating a second guess at the ratio.
const IMAGE_WIDTH = 1246;
const IMAGE_HEIGHT = 976;
const IMAGE_RATIO = { aspectRatio: `${IMAGE_WIDTH} / ${IMAGE_HEIGHT}` };

// OrderConfirmation — final "thank you" screen shown after an order is placed (thank-you.tsx),
// read from the orderId URL param. Reconciled against real data: the coupon/gift-card box has no
// backing (no promo system exists, same reasoning as dropping the promo-code link in the payment
// step) and is dropped; the fake masked card number ("Visa **** 8395") is replaced with the real
// payment method label, since the app never captures a real card number. "You May Also Like" uses
// real featured products from the catalog — already fetched here via ProductCatalogProvider,
// which app/(site)/checkout/layout.tsx scopes to /checkout and /checkout/confirmation — instead of
// the template's furniture demo cards, excluding whatever was just purchased. The card markup is
// hand-built to match this file's own (simpler) card structure rather than reusing
// product-card.tsx's ProductCard, which hardcodes a 4-per-row column class meant for full-width
// grids and would missize inside this narrower sidebar column.
export function OrderConfirmation() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";
  const [order, setOrder] = useState<Order | null | undefined>(undefined); // undefined = still loading
  const { products, getCategoryById } = useProductCatalog();

  useEffect(() => {
    if (!orderId) return; // no id in the URL — the render logic below treats that as "not found"

    let active = true;
    getOrderById(orderId).then((result) => {
      if (active) setOrder(result ?? null);
    });
    return () => {
      active = false;
    };
  }, [orderId]);

  if (orderId && order === undefined) {
    return (
      <div className="container-page flex flex-col items-center gap-3 py-16 text-center text-base text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          {t("checkout.orderNotFound")}
        </p>
        <Link href="/" className="rbt-btn">
          {t("common.continueShopping")}
        </Link>
      </div>
    );
  }

  const purchasedProductIds = new Set(order.items.map((item) => item.productId));
  const recommended = products
    .filter((product) => !purchasedProductIds.has(product.id) && getDisplayVariant(product))
    .sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false))
    .slice(0, 4);

  return (
    <>
      <div className="rbt-breadcrumb-two rbt-bg-color-white">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="rbt-breadcrumb-inner text-left">
                <ul className="rbt-breadcrumb-page-list justify-content-start mt--0">
                  <li className="rbt-breadcrumb-item">
                    <Link href="/">
                      Home
                    </Link>
                  </li>
                  <li>
                    <div className="icon-right">
                      <i className="fa-solid fa-chevron-right" />
                    </div>
                  </li>
                  <li className="rbt-breadcrumb-item">
                    <a href="#">
                      Checkout
                    </a>
                  </li>
                  <li>
                    <div className="icon-right">
                      <i className="fa-solid fa-chevron-right" />
                    </div>
                  </li>
                  <li className="rbt-breadcrumb-item active">
                    Thank You
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="rbt-component-area rbt-cart-page rbt-section-gapBottom rbt-bg-color-white">
        <div className="container">
          <div className="row row--12 mt_dec--24 justify-content-center">
            <div className="col-xl-8 col-12 col-md-12 col-lg-12 mt--24 rbt-scrollable-content rbt-checkout-single-content">
              <div className="w-100 pt-sm-2 pt-md-3 pt-lg-4 pb-lg-4 pb-xl-5 px-3 px-sm-4 pe-lg-0 ps-lg-5">
                <div className="d-flex align-items-sm-center border-bottom pb-3 pb-md-4 active">
                  <div className="rbt-checkout-step rbt-bg-color-success rbt-text-color-white">
                    <i className="fa-solid fa-check" />
                  </div>
                  <div className="w-100 ps-3">
                    <div className="fs-sm mb-1">
                      {t("checkout.orderNumber")} {order.orderNumber}
                    </div>
                    <div className="d-sm-flex align-items-center">
                      <h1 className="h4 mb-0 me-3">
                        Thank you for your order!
                      </h1>
                      <div className="nav mt-2 mt-sm-0 ms-auto rbt-link-hover">
                        <Link className="nav-link p-0" href={`/account/orders/${order.id}`}>
                          Track order
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="d-flex flex-column gap-4 pt-3 pb-5 mt-3">
                  <div>
                    <h2 className="h6 mb-2">
                      Delivery
                    </h2>
                    <p className="fs-sm mb-0">
                      {order.shippingAddress.addressLine}, {order.shippingAddress.area}, {order.shippingAddress.city}
                    </p>
                  </div>
                  {order.installation && (
                    <div>
                      <h2 className="h6 mb-2">
                        Time
                      </h2>
                      <p className="fs-sm mb-0">
                        {order.installation.date} · {order.installation.timeSlot}
                      </p>
                    </div>
                  )}
                  <div>
                    <h2 className="h6 mb-2">
                      Payment
                    </h2>
                    <p className="fs-sm mb-0">
                      {t(`paymentMethod.${order.paymentMethod}`)} · {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
                <p className="rbt-link-hover fs-sm pt-4 pt-md-5 mt-2 mt-sm-3 mt-md-0 mb-0">
                  Need help?
                  <Link className="fw-medium ms-2" href="/contact">
                    Contact us
                  </Link>
                </p>
              </div>
            </div>
            {recommended.length > 0 && (
              <div className="col-xl-4 col-lg-12 mt--24">
                <div className="row row--12">
                  <div className="col-12 text-center">
                    <h2 className="title mb--0 h5">
                      <span className="rbt-bold--text">
                        You May Also Like
                      </span>
                    </h2>
                  </div>
                </div>
                <div className="row row--12 rbt-mobile-row">
                  {recommended.map((product) => {
                    const variant = getDisplayVariant(product);
                    if (!variant) return null;
                    const category = getCategoryById(product.categoryId);

                    return (
                      <div className="col-xl-6 col-lg-3 col-sm-6 col-12 mt--24" key={product.id}>
                        <div className="rbt-card rbt-product-card has-hover-box-shadow">
                          <div className="inner">
                            <div className="rbt-card-img rbt-bg-color-default">
                              <Link href={`/product/${product.slug}`}>
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  width={IMAGE_WIDTH}
                                  height={IMAGE_HEIGHT}
                                  style={IMAGE_RATIO}
                                />
                              </Link>
                            </div>
                            <div className="rbt-card-body p-0 pt--4">
                              {category && (
                                <Link href={`/category/${category.slug}`} className="rbt-card-subtitle rbt-card-catagories-text">
                                  {category.name}
                                </Link>
                              )}
                              <h2 className="rbt-card-title b3">
                                <Link href={`/product/${product.slug}`}>
                                  {product.name}
                                </Link>
                              </h2>
                              <div className="pricing-part">
                                <span className="price-text">
                                  {formatPrice(variant.price)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
