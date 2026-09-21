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
import { useAddToCartButton } from "@/context/cart-context";
import { useCompare } from "@/context/compare-context";
import { useWishlist } from "@/context/wishlist-context";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import { getDiscountPercent } from "@/lib/product-helpers";
import type { WhyShopFeature } from "@/lib/settings";
import { buildSpecRows } from "@/lib/specs";
import type { Category } from "@/types/category";
import type { Product, Variant } from "@/types/product";
import type { Review } from "@/types/review";

interface ProductDetailProps {
  product: Product;
  category: Category;
  relatedProducts: Product[];
  reviews: Review[];
  whyShopIntro: string | null;
  whyShopFeatures: WhyShopFeature[];
}

// Every value in the template's buybox markup that has no field behind it yet. Kept in one
// block so the whole backlog is visible in one place.
// TODO: wire to backend
const PLACEHOLDER = {
  starCount: 5,
  emptyStarIcon: "fa-regular fa-star",
  // No deal-end-date tracking exists — same gap that got
  // product-countdown.tsx deleted earlier. Kept as static decoration per explicit instruction
  // rather than dropped, since this section already has actual real data (price, stock) doing
  // the same "why buy now" job right next to it.
  countdown: { days: 87, hours: 23, minutes: 38, seconds: 27 },
  stockProgressPercent: 50,
};

// Full product detail page: gallery, price, variant picker, add-to-cart, specs, related items.
export function ProductDetail({
  product,
  category,
  relatedProducts,
  reviews,
  whyShopIntro,
  whyShopFeatures,
}: ProductDetailProps) {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<Variant>(
    // default to the first in-stock variant, falling back to the first variant if all are sold out
    product.variants.find((variant) => variant.stock > 0) ?? product.variants[0]
  );
  const [quantity, setQuantity] = useState(1);

  const { addToCart, isAdding } = useAddToCartButton();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();

  const inWishlist = isInWishlist(product.id, selectedVariant.id);
  const inCompare = isInCompare(product.id);
  const isOutOfStock = selectedVariant.stock === 0;
  const isAddingSelected = isAdding(selectedVariant.id);
  const images = selectedVariant.images?.length ? selectedVariant.images : product.images;
  const specRows = buildSpecRows([{ product, variant: selectedVariant }], category);

  // The template's spec list is 4 rows: brand, then three specs. Same shape as ProductCard's
  // spec block, including the dropped continuation line: it rendered a 4th spec's value with
  // no key in front of it, so it read as an orphan number under the last row. The full spec
  // list with proper labels is right below in the Specifications tab either way.
  const compactSpecRows = Object.entries(product.specs).slice(0, 3);

  const discountPercent = getDiscountPercent(selectedVariant);

  function handleSelectVariant(variant: Variant) {
    setSelectedVariant(variant);
    setQuantity(1); // reset quantity since stock/context changed with the new variant
  }

  function handleAddToCart() {
    addToCart(product.id, selectedVariant.id, quantity);
  }

  // Waits for the save so checkout never opens before the item is in the cart
  async function handleBuyNow() {
    if (await addToCart(product.id, selectedVariant.id, quantity)) router.push("/checkout");
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
                    disabled={isOutOfStock || isAddingSelected}
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
                    disabled={isOutOfStock || isAddingSelected}
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
                    {compactSpecRows.map(([specKey, specValue]) => (
                      <li key={specKey}>
                        <span className="rbt-bold--text mr--4">
                          {specKey} :
                        </span>
                        <span className="text">
                          {String(specValue)}
                        </span>
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

      {/* .row/.container ancestors are a structural requirement for the Bootstrap col-12
          below, not part of the pasted markup. */}
      <div className="rbt-component-area rbt-section-gap">
        <div className="container">
          <div className="row">
            <ProductTabs
              product={product}
              category={category}
              specRows={specRows}
              reviews={reviews}
              whyShopIntro={whyShopIntro}
              whyShopFeatures={whyShopFeatures}
            />
          </div>
        </div>
      </div>

      <div className="container py-6">
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
