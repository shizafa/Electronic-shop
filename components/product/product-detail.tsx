"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ComboProduct } from "@/components/product/combo-product";
import { ProductAlternativeItem } from "@/components/product/product-alternative-item";
import { ProductCard } from "@/components/product/product-card";
import { ProductCardTextSwiper } from "@/components/product/product-card-text-swiper";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductRegisterBanner } from "@/components/product/product-register-banner";
import { ProductTabs } from "@/components/product/product-tabs";
import { VariantSelector } from "@/components/product/variant-selector";
import { useCart } from "@/context/cart-context";
import { useCompare } from "@/context/compare-context";
import { useWishlist } from "@/context/wishlist-context";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import { buildSpecRows } from "@/lib/specs";
import type { Category } from "@/types/category";
import type { Product, Variant } from "@/types/product";
import type { Review } from "@/types/review";

interface ProductDetailProps {
  product: Product;
  category: Category;
  relatedProducts: Product[];
  reviews: Review[];
}

// Every value in the template's buybox markup that has no field behind it yet. Kept in one
// block so the whole backlog is visible in one place.
// TODO: wire to backend
const PLACEHOLDER = {
  starCount: 5,
  emptyStarIcon: "fa-regular fa-star",
  // No deal-end-date, sales-velocity, or live-viewer tracking exists — same gap that got
  // product-countdown.tsx deleted earlier. Kept as static decoration per explicit instruction
  // rather than dropped, since this section already has actual real data (price, stock) doing
  // the same "why buy now" job right next to it.
  countdown: { days: 87, hours: 23, minutes: 38, seconds: 27 },
  soldRecently: "34 products sold in last 10 hours.",
  viewingNow: "20 people are viewing this",
  stockProgressPercent: 50,
};

// Full product detail page: gallery, price, variant picker, add-to-cart, specs, related items.
export function ProductDetail({ product, category, relatedProducts, reviews }: ProductDetailProps) {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<Variant>(
    // default to the first in-stock variant, falling back to the first variant if all are sold out
    product.variants.find((variant) => variant.stock > 0) ?? product.variants[0]
  );
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();

  const inWishlist = isInWishlist(product.id, selectedVariant.id);
  const inCompare = isInCompare(product.id);
  const isOutOfStock = selectedVariant.stock === 0;
  const images = selectedVariant.images?.length ? selectedVariant.images : product.images;
  const specRows = buildSpecRows([{ product, variant: selectedVariant }], category);

  // The template's spec list is 4 rows: brand, then three specs. A 4th spec, when the product
  // has one, fills the continuation line the template's last row carries. Same shape as
  // ProductCard's spec block.
  const specEntries = Object.entries(product.specs);
  const compactSpecRows = specEntries.slice(0, 3);
  const specContinuation = specEntries[3];

  const discountPercent = selectedVariant.compareAtPrice
    ? Math.round(
        ((selectedVariant.compareAtPrice - selectedVariant.price) / selectedVariant.compareAtPrice) * 100
      )
    : undefined;

  function handleSelectVariant(variant: Variant) {
    setSelectedVariant(variant);
    setQuantity(1); // reset quantity since stock/context changed with the new variant
  }

  function handleAddToCart() {
    addToCart(product.id, selectedVariant.id, quantity);
  }

  function handleBuyNow() {
    addToCart(product.id, selectedVariant.id, quantity);
    router.push("/checkout");
  }

  function handleWishlistToggle() {
    if (inWishlist) {
      removeFromWishlist({ productId: product.id, variantId: selectedVariant.id });
    } else {
      addToWishlist({ productId: product.id, variantId: selectedVariant.id });
    }
  }

  function handleCompareToggle() {
    if (inCompare) {
      removeFromCompare(product.id);
    } else {
      // addToCompare shows a toast itself if the category doesn't match
      // what's already being compared, or the 4-item cap is reached.
      addToCompare(product.id, product.categoryId);
    }
  }

  return (
    <div>
      <div className="rbt-component-area rbt-single-product-area rbt-bg-color-white rbt-section-gapBottom">
        <div className="container">
          <div className="row row--20 mt_dec--16 justify-content-center">
            <div className="col-xl-7 col-lg-12 col-12 mt--16">
              <ProductGallery
                images={images}
                alt={product.name}
                badge={isOutOfStock ? t("common.outOfStock") : discountPercent !== undefined ? t("common.sale") : undefined}
              />
            </div>
            <div className="col-xl-5 col-lg-12 col-12 mt--16">
              <div className="rbt-single-product-content ptb--0 rbt-product-variations">
                <ProductRegisterBanner />

                <Link href={`/category/${category.slug}`} className="rbt-card-subtitle rbt-card-catagories-text mt--16">
                  {category.name}
                </Link>
                <h2 className="rbt-card-title mt--12">
                  {product.name}
                </h2>
                <p className="description-text b2 mt--16">
                  {product.description}
                </p>

                <div className="rbt-info-wrapper d-flex justify-content-between mt--16">
                  <div className="rbt-store-price-1">
                    <div className="pricing-part mt--0">
                      {discountPercent !== undefined && (
                        <del className="price-text">
                          {formatPrice(selectedVariant.compareAtPrice as number)}
                        </del>
                      )}
                      <span className="price-text">
                        {formatPrice(selectedVariant.price)}
                      </span>
                      {discountPercent !== undefined && (
                        <span className="rbt-offer-badge rbt-offer-badge-md">
                          {t("common.save")} {discountPercent}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="rbt-quick-access-banner-action-btn d-flex align-items-center">
                    <button className="rbt-btn rbt-btn-xs rbt-btn-secondary d-flex align-items-center" type="button">
                      <i className="fa-regular fa-location-dot mr--4" />
                      Find A Near Store
                    </button>
                  </div>
                </div>

                <div className="rbt-info-wrapper d-flex mt--28">
                  <div className="rbt-card-rating mt--0">
                    <ul className="rbt-rating-icon-list">
                      {Array.from({ length: PLACEHOLDER.starCount }).map((_, index) => (
                        <li key={index}>
                          <i
                            className={
                              index < Math.round(product.averageRating)
                                ? "fa-solid fa-star rbt-rated-icon"
                                : PLACEHOLDER.emptyStarIcon
                            }
                          />
                        </li>
                      ))}
                    </ul>
                    <p className="rating-digit">
                      ({product.reviewCount})
                    </p>
                    <ProductCardTextSwiper />
                  </div>
                  <div className="prd-info-section has-left-separator">
                    <div className="prd-id-text">
                      <p className="text-bold">
                        SKU:
                      </p>
                      <p>
                        {selectedVariant.sku}
                      </p>
                    </div>
                    <div
                      className={`rbt-badge rbt-badge-border rbt-badge-small rbt-badge-rounded ${
                        isOutOfStock ? "rbt-badge-bg-secondary-gradient" : "rbt-badge-bg-green"
                      }`}
                    >
                      {isOutOfStock
                        ? t("common.outOfStock")
                        : t("common.inStockCount").replace("{count}", String(selectedVariant.stock))}
                    </div>
                  </div>
                </div>

                <div className="rbt-info-wrapper d-flex mt--24">
                  <div className="prd-info-section">
                    <div className="prd-id-text">
                      <p className="text-bold">
                        {t("common.brand")}:
                      </p>
                      <p>
                        {product.brand}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rbt-info-wrapper d-flex mt--24 rbt-gap--12 flex-wrap">
                  <div className="prd-info-section">
                    <span className="rbt-quick-info-tag d-flex align-items-center rbt-gap--8 rbt-flash-animation">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M18.9706 14.9359C18.8148 18.8649 15.7493 22 11.9891 22C8.12909 22 5 18.5858 5 14.6221C5 14.0924 4.99101 13.0336 5.74352 11.2472C6.19387 10.1781 6.47633 9.50646 6.63574 8.89253C6.72333 8.55511 6.89367 8.01904 7.37926 8.89253C7.66559 9.40757 7.67666 10.1483 7.67666 10.1483C7.67666 10.1483 8.74197 9.28536 9.4611 7.63673C10.5153 5.21985 9.67419 3.77512 9.38675 2.77048C9.28727 2.42294 9.22481 1.79833 9.90721 2.06409C10.6025 2.33495 12.4408 3.69334 13.4017 5.12512C14.7732 7.16855 15.2605 9.128 15.2605 9.128C15.2605 9.128 15.6997 8.55268 15.8553 7.95068C16.0312 7.27089 16.0338 6.59763 16.5988 7.32285C17.1361 8.01253 17.9341 9.3086 18.3833 10.5408C19.1989 12.7784 18.9706 14.9359 18.9706 14.9359Z" fill="url(#paint0_linear_3632_18878)" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M11.9999 22C9.23852 22 7 19.7944 7 17.0735C7 15.4318 7.67145 14.435 9.0689 13.0833C9.96366 12.2179 10.8011 11.1549 11.157 10.4311C11.2271 10.2886 11.3866 9.54605 12.0014 10.4155C12.3239 10.8714 12.8296 11.6823 13.1538 12.3744C13.7127 13.5676 13.8461 14.7239 13.8461 14.7239C13.8461 14.7239 14.3938 14.4059 14.7692 13.5871C14.8902 13.3232 15.1348 12.3241 15.8186 13.323C16.3204 14.0561 17.0097 15.3741 16.9999 17.0735C16.9999 19.7944 14.7613 22 11.9999 22Z" fill="#FC9502" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M12.1019 16C12.8497 16 12.8497 17.4475 13.7996 19.3803C14.4321 20.6672 13.486 22 12.1019 22C10.7178 22 10 20.8271 10 19.3803C10 17.9335 11.3541 16 12.1019 16Z" fill="#FCE202" />
                        <defs>
                          <linearGradient id="paint0_linear_3632_18878" x1="11.9995" y1="22.0148" x2="11.9995" y2="2.01511" gradientUnits="userSpaceOnUse">
                            <stop offset="1" stopColor="#FF4C0D" />
                            <stop offset="1" stopColor="#FC9502" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <p>
                        <strong>
                          {PLACEHOLDER.soldRecently}
                        </strong>
                      </p>
                    </span>
                  </div>
                  <div className="prd-info-section">
                    <span className="rbt-quick-info-tag d-flex align-items-center rbt-gap--8 rbt-shiny">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="10" viewBox="0 0 14 10" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M1.98586 5.18652C1.93484 5.12038 1.88687 5.05807 1.84423 5.00038C2.25958 4.44469 2.71871 3.92381 3.21712 3.44281C4.28087 2.42212 5.61949 1.53911 7 1.53911C8.38051 1.53911 9.71837 2.42212 10.7829 3.44281C11.2813 3.92383 11.7404 4.44471 12.1558 5.00038C11.7402 5.55588 11.2811 6.07675 10.7829 6.55796C9.71837 7.57865 8.38051 8.46166 7 8.46166C5.61949 8.46166 4.28163 7.57865 3.21712 6.55796C2.77476 6.13114 2.36329 5.67282 1.98586 5.18652ZM13.7297 4.58042L13.0916 5.00038L13.7297 5.42035L13.7282 5.42266L13.7259 5.42574L13.7183 5.43804L13.6901 5.47958C13.5374 5.70347 13.378 5.92253 13.2119 6.13645C12.789 6.68142 12.3279 7.19501 11.8322 7.67326C10.6915 8.76779 8.98433 10 7 10C5.01566 10 3.3085 8.76779 2.16785 7.67326C1.47767 7.00644 0.855254 6.27156 0.30991 5.47958C0.300444 5.46579 0.291053 5.45194 0.281736 5.43804L0.274122 5.42574L0.271837 5.42266L0.271076 5.42112C0.271076 5.42035 0.270314 5.42035 0.908409 5.00038L0.270314 4.58042L0.271837 4.57811L0.274122 4.57503L0.281736 4.56273C0.323524 4.49897 0.366683 4.43614 0.411182 4.37428C0.932338 3.63825 1.52073 2.95324 2.16861 2.32828C3.30773 1.23144 5.01566 0 7 0C8.98433 0 10.6915 1.23221 11.8322 2.32674C12.5223 2.99355 13.1448 3.72843 13.6901 4.52042L13.7183 4.56196L13.7259 4.57426L13.7282 4.57734L13.7289 4.57888L13.7297 4.58042ZM13.0916 5.00038L13.7297 4.58042L14 5.00038L13.7297 5.42035L13.0916 5.00038ZM0.270314 4.58042L0.908409 5.00038L0.270314 5.42035L0 5.00038L0.270314 4.58042ZM6.23855 5.00038C6.23855 4.79639 6.31877 4.60075 6.46157 4.4565C6.60437 4.31225 6.79805 4.23121 7 4.23121C7.20195 4.23121 7.39563 4.31225 7.53842 4.4565C7.68122 4.60075 7.76145 4.79639 7.76145 5.00038C7.76145 5.20438 7.68122 5.40002 7.53842 5.54427C7.39563 5.68852 7.20195 5.76956 7 5.76956C6.79805 5.76956 6.60437 5.68852 6.46157 5.54427C6.31877 5.40002 6.23855 5.20438 6.23855 5.00038ZM7 2.69287C6.39415 2.69287 5.81312 2.93598 5.38472 3.36873C4.95632 3.80147 4.71565 4.38839 4.71565 5.00038C4.71565 5.61238 4.95632 6.1993 5.38472 6.63204C5.81312 7.06479 6.39415 7.3079 7 7.3079C7.60585 7.3079 8.18688 7.06479 8.61528 6.63204C9.04367 6.1993 9.28435 5.61238 9.28435 5.00038C9.28435 4.38839 9.04367 3.80147 8.61528 3.36873C8.18688 2.93598 7.60585 2.69287 7 2.69287Z" fill="#24BD25" />
                      </svg>
                      <p>
                        <strong>
                          {PLACEHOLDER.viewingNow}
                        </strong>
                      </p>
                    </span>
                  </div>
                </div>

                <VariantSelector product={product} selectedVariant={selectedVariant} onSelectVariant={handleSelectVariant} />

                <div className="rbt-info-wrapper d-block mt--24">
                  <div className="rbt-countdown-banner rbt-countdown-banner-sm rbt-countdown-banner-has-bg-01">
                    <span className="b3 rbt-title">
                      Special Offer :
                    </span>
                    <div className="rbt-countdown-section">
                      <div className="rbt-countdown-one bg-variation-white cd-border-style">
                        <div className="countdown">
                          <div className="countdown-container days">
                            <span className="countdown-value">
                              {PLACEHOLDER.countdown.days}
                            </span>
                            <span className="countdown-heading">
                              Days
                            </span>
                          </div>
                          <div className="countdown-container hours">
                            <span className="countdown-value">
                              {PLACEHOLDER.countdown.hours}
                            </span>
                            <span className="countdown-heading">
                              Hours
                            </span>
                          </div>
                          <div className="countdown-container minutes">
                            <span className="countdown-value">
                              {PLACEHOLDER.countdown.minutes}
                            </span>
                            <span className="countdown-heading">
                              Minutes
                            </span>
                          </div>
                          <div className="countdown-container seconds">
                            <span className="countdown-value">
                              {PLACEHOLDER.countdown.seconds}
                            </span>
                            <span className="countdown-heading">
                              Seconds
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="rbt-desc b4">
                      Remains until the end of the offer.
                    </span>
                  </div>
                </div>

                <div className="rbt-info-wrapper d-block mt--24">
                  <div className="rbt-prd-qty-area">
                    <p className="prd-qty-txt">
                      <strong>
                        {isOutOfStock ? t("common.outOfStock") : `Only ${selectedVariant.stock} pc left`}
                      </strong>
                    </p>
                    <div
                      className="progress"
                      role="progressbar"
                      aria-label="Shipping-progress"
                      aria-valuenow={PLACEHOLDER.stockProgressPercent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div className="progress-bar" style={{ width: `${PLACEHOLDER.stockProgressPercent}%` }} />
                    </div>
                  </div>
                </div>

                <div className="product-btn-grp">
                  <div className="rbt-qty-area">
                    <button
                      type="button"
                      className="qty-item-btn qty-item-btn-decr"
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      disabled={isOutOfStock || quantity <= 1}
                      aria-label={t("product.decreaseQuantity")}
                    >
                      <i className="fa-solid fa-minus" />
                    </button>
                    <input type="number" className="items-qty-input" value={quantity} min={1} readOnly />
                    <button
                      type="button"
                      className="qty-item-btn qty-item-btn-incr"
                      onClick={() => setQuantity((current) => Math.min(selectedVariant.stock, current + 1))}
                      disabled={isOutOfStock || quantity >= selectedVariant.stock}
                      aria-label={t("product.increaseQuantity")}
                    >
                      <i className="fa-solid fa-plus" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="rbt-btn rbt-btn-border has-left-icon d-block text-center"
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                  >
                    <i className="fa-regular fa-cart-shopping" />
                    {t("common.addToCart")}
                  </button>
                </div>
                <div className="prd-btn-grp">
                  <button
                    type="button"
                    className="rbt-btn d-block text-center"
                    disabled={isOutOfStock}
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </button>
                </div>

                <div className="rbt-quick-link-grp">
                  <button className="rbt-quick-link" type="button" onClick={handleCompareToggle}>
                    <i className="fa-sharp fa-regular fa-copy" />
                    {inCompare ? t("common.removeFromCompare") : t("common.addToCompare")}
                  </button>
                  <button className="rbt-quick-link" type="button" onClick={handleWishlistToggle}>
                    <i className="fa-sharp fa-regular fa-heart" />
                    {inWishlist ? t("common.removeFromWishlist") : t("common.addToWishlist")}
                  </button>
                  <button className="rbt-quick-link" type="button">
                    <i className="fa-sharp fa-regular fa-share-nodes" />
                    Share
                  </button>
                </div>
                <hr className="rbt-separator rbt-separator-gray200 mt--24 mb--24" />

                {relatedProducts.length > 0 && (
                  <>
                    <div className="rbt-info-wrapper d-block mt--24">
                      <div className="rbt-info-box rbt-bg-color-brand-50">
                        <p className="text-bold rbt-info-title b1">
                          Alternative For This Product
                        </p>
                        <div className="rbt-list-product-container d-flex flex-column rbt-gap--24">
                          {relatedProducts.map((relatedProduct) => (
                            <ProductAlternativeItem
                              key={relatedProduct.id}
                              product={relatedProduct}
                              categoryName={category.name}
                              categorySlug={category.slug}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <hr className="rbt-separator rbt-separator-gray200 mt--24 mb--24" />
                  </>
                )}

                <div className="rbt-info-wrapper d-block mt--24">
                  <ul className="product-details-list shipment-details-list">
                    <li>
                      <span className="rbt-bold--text mr--4">
                        {t("common.brand")} :
                      </span>
                      <span className="text">
                        {product.brand}
                      </span>
                    </li>
                    {compactSpecRows.map(([specKey, specValue], index) => (
                      <li key={specKey}>
                        <span className="rbt-bold--text mr--4">
                          {specKey} :
                        </span>
                        <span className="text">
                          {String(specValue)}
                        </span>
                        {index === compactSpecRows.length - 1 && specContinuation && (
                          <span className="text d-block">
                            {String(specContinuation[1])}
                          </span>
                        )}
                      </li>
                    ))}
                    <li>
                      <span className="icon">
                        <i className="fa-sharp fa-regular fa-truck" />
                      </span>
                      <div className="right-content">
                        <span className="rbt-bold--text mr--4">
                          Ships :
                        </span>
                        <span className="text">
                          2–3 weeks Free Shipping
                        </span>
                      </div>
                    </li>
                    <li>
                      <span className="icon">
                        <i className="fa-regular fa-bag-shopping" />
                      </span>
                      <div className="right-content">
                        <span className="rbt-bold--text mr--4">
                          7 Days Returns :
                        </span>
                        <span className="text">
                          Free return within 7 days of purchase
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
                <hr className="rbt-separator rbt-separator-gray200 mt--24 mb--24" />
                <div className="rbt-info-wrapper d-block mt--24">
                  <div className="rbt-info-box rbt-bg-color-brand-50">
                    <div className="rbt-payment-info-container">
                      <ul className="payment-img-link">
                        <li>
                          <img src="/assets/images/payment-brand/image-01.webp" alt="" />
                        </li>
                      </ul>
                      <span className="b2 rbt-text-medium text-center rbt-text-color-heading mt--12 d-block">
                        Guaranteed safe & secure checkout
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ComboProduct relatedProducts={relatedProducts} />

      {/* .row/.container ancestors are a structural requirement for the Bootstrap col-xl-8
          below, not part of the pasted markup — a sibling col-xl-4 is expected to land in
          this same .row in a later paste. */}
      <div className="rbt-component-area rbt-section-gap">
        <div className="container">
          <div className="row">
            <ProductTabs product={product} category={category} specRows={specRows} reviews={reviews} />
          </div>
        </div>
      </div>

      <div className="container-page py-6">
        {relatedProducts.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold sm:text-2xl">{t("product.similarItems")}</h2>
            <div className="mt-5">
              <ProductGrid priorityCount={0}>
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} categoryName={category.name} categorySlug={category.slug} />
                ))}
              </ProductGrid>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
