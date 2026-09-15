"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Swiper as SwiperClass } from "swiper";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { ProductCardTextSwiper } from "@/components/product/product-card-text-swiper";
import { VariantSelector } from "@/components/product/variant-selector";
import { useAddToCartButton } from "@/context/cart-context";
import { useCompare } from "@/context/compare-context";
import { useQuickView } from "@/context/quick-view-context";
import { useWishlist } from "@/context/wishlist-context";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import { getDisplayVariant } from "@/lib/product-helpers";
import type { Product, Variant } from "@/types/product";

import "swiper/css";
import "swiper/css/navigation";

const MAIN_IMAGE_WIDTH = 720;
const MAIN_IMAGE_HEIGHT = 552;
const MAIN_IMAGE_RATIO = { aspectRatio: `${MAIN_IMAGE_WIDTH} / ${MAIN_IMAGE_HEIGHT}` };
const THUMB_IMAGE_WIDTH = 80;
const THUMB_IMAGE_HEIGHT = 61;

interface QuickViewEntry {
  product: Product;
  categoryName?: string;
  categorySlug?: string;
}

// Quick View modal, opened by any ProductCard's magnifying-glass button
// (product-card-quick-view-button.tsx) via QuickViewContext. Same Bootstrap-modal-without-
// Bootstrap-JS rebuild as compare-model.tsx/wishlist-model.tsx: "show" class + inline display,
// a manually-rendered .modal-backdrop, backdrop click and Escape both close it.
//
// The pasted template markup wrapped the whole thing in a second, outer Swiper
// (rbt-qs-wrapper-slide-acivation) holding two copies of the exact same demo product, wired to
// arrows at the very bottom of the modal — that's a product-to-product carousel for browsing
// quick views of *other* products without closing the modal. There's no "other products in
// this list" data available at the trigger site (ProductCard only knows its own product), so
// that outer carousel is dropped; the modal shows exactly the one product it was opened for.
//
// The image gallery keeps the pasted markup's own two-swiper structure (main image +
// horizontal thumb strip) for the main slider, but the thumb strip itself is a plain flex row
// of buttons rather than a second Swiper instance — product-gallery.tsx already tried a linked
// second Swiper for its own thumb rail and hit repeated reliability issues (slides collapsing
// or not rendering); this reuses that component's proven fallback instead of reintroducing the
// same failure mode here.
export function QuickViewModal() {
  const { entry, isQuickViewModalOpen, closeQuickViewModal } = useQuickView();

  useEffect(() => {
    if (!isQuickViewModalOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeQuickViewModal();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isQuickViewModalOpen, closeQuickViewModal]);

  return (
    <>
      {isQuickViewModalOpen && <div className="modal-backdrop fade show" onClick={closeQuickViewModal} />}
      <div
        className={`rbt-default-modal modal fade has-rbt-top-folder-shape${isQuickViewModalOpen ? " show" : ""}`}
        id="quickviewModal"
        style={{ display: isQuickViewModalOpen ? "block" : "none" }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quickviewModalLabel"
        aria-hidden={!isQuickViewModalOpen}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="rbt-folder-shape-right-portion">
              <svg xmlns="http://www.w3.org/2000/svg" width="85" height="90" viewBox="0 0 85 90" fill="none">
                <path d="M0 0H11.1844C14.5695 0 17.7971 1.42971 20.0716 3.93671L82.1927 72.4059C83.9992 74.397 84.9999 76.9893 84.9999 79.6778C84.9999 85.6547 85.0001 90 85.0001 90H0V0Z" fill="white" />
              </svg>
            </div>
            <div className="modal-header">
              <button type="button" className="rbt-round-btn rbt-modal-dis-btn" onClick={closeQuickViewModal} aria-label="Close">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="rbt-top-folder-shape-wrapper">
              <div className="rbt-content-trs-portion rbt-arrow-between rbt-swiper-container-one rbt-arrow-between-lg-dis">
                {entry && <QuickViewContent key={entry.product.id} entry={entry} onClose={closeQuickViewModal} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Keyed by product id from the parent, so switching which product is quick-viewed remounts
// this with fresh state instead of carrying over the previous product's selected variant/qty.
function QuickViewContent({ entry, onClose }: { entry: QuickViewEntry; onClose: () => void }) {
  const router = useRouter();
  const { product, categoryName, categorySlug } = entry;

  const [selectedVariant, setSelectedVariant] = useState<Variant>(
    getDisplayVariant(product) ?? product.variants[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [mainSwiper, setMainSwiper] = useState<SwiperClass | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevEl, setPrevEl] = useState<HTMLDivElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLDivElement | null>(null);

  const { addToCart, isAdding } = useAddToCartButton();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();

  const inWishlist = isInWishlist(product.id, selectedVariant.id);
  const inCompare = isInCompare(product.id);
  const isOutOfStock = selectedVariant.stock === 0;
  const isAddingSelected = isAdding(selectedVariant.id);
  const images = selectedVariant.images?.length ? selectedVariant.images : product.images;

  const discountPercent = selectedVariant.compareAtPrice
    ? Math.round(((selectedVariant.compareAtPrice - selectedVariant.price) / selectedVariant.compareAtPrice) * 100)
    : undefined;

  function handleSelectVariant(variant: Variant) {
    setSelectedVariant(variant);
    setQuantity(1);
    setActiveIndex(0);
    mainSwiper?.slideTo(0);
  }

  function handleAddToCart() {
    addToCart(product.id, selectedVariant.id, quantity);
  }

  // Waits for the save so checkout never opens before the item is in the cart
  async function handleBuyNow() {
    if (!(await addToCart(product.id, selectedVariant.id, quantity))) return;
    onClose();
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
      addToCompare(product.id, product.categoryId);
    }
  }

  return (
    <div className="rbt-single-product-area">
      <div className="row row--16">
        <div className="col-lg-6 col-12">
          <div className="rbt-product-view-slider rbt-single-product-media-area rbt-single-product-media-has-folder-shape">
            <Swiper
              className="swiper rbt-arrow-between rbt-product-single-slider-activation rbt-arrow-show-dfl"
              modules={[Navigation]}
              onSwiper={setMainSwiper}
              navigation={{ prevEl, nextEl }}
              onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            >
              {images.map((image, index) => (
                <SwiperSlide key={image}>
                  <div className="thumbnail radius-16">
                    <div className="rbt-product-single-img">
                      <Image
                        className="w-100"
                        src={image}
                        alt={product.name}
                        width={MAIN_IMAGE_WIDTH}
                        height={MAIN_IMAGE_HEIGHT}
                        style={MAIN_IMAGE_RATIO}
                        priority={index === 0}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
              <div slot="container-end" ref={setPrevEl} className="rbt-swiper-arrow rbt-modal-arrow-sm-left">
                <div className="custom-overflow">
                  <i className="rbt-icon fa-regular fa-arrow-left" />
                  <i className="rbt-icon-top fa-regular fa-arrow-left" />
                </div>
              </div>
              <div slot="container-end" ref={setNextEl} className="rbt-swiper-arrow rbt-modal-arrow-sm-right">
                <div className="custom-overflow">
                  <i className="rbt-icon fa-regular fa-arrow-right" />
                  <i className="rbt-icon-top fa-regular fa-arrow-right" />
                </div>
              </div>
            </Swiper>

            {images.length > 1 && (
              <div className="rbt-product-thumb-slider-activation mt--24 mt_sm--16 d-flex flex-wrap rbt-gap--8">
                {images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    className="thumbnail d-block"
                    aria-label={`${product.name} ${index + 1}`}
                    aria-current={index === activeIndex}
                    onClick={() => mainSwiper?.slideTo(index)}
                    style={{
                      border: index === activeIndex ? "2px solid var(--color-primary)" : "2px solid transparent",
                      borderRadius: "8px",
                    }}
                  >
                    <span className="rbt-thumb-img-sm">
                      <Image className="w-100" src={image} alt="" width={THUMB_IMAGE_WIDTH} height={THUMB_IMAGE_HEIGHT} />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="col-lg-6 col-12 mt_sm--12 content">
          {categoryName && categorySlug && (
            <Link href={`/category/${categorySlug}`} className="rbt-card-subtitle rbt-card-catagories-text mt--0" onClick={onClose}>
              {categoryName}
            </Link>
          )}
          <div className="rbt-card-title h4">
            <Link href={`/product/${product.slug}`} onClick={onClose}>
              {product.name}
            </Link>
          </div>
          <div className="rbt-scroll-vertical-wrapper rbt-vertical-height-sm">
            <div className="rbt-scroll-vertical content">
              <p className="description-text b2">
                {product.description}
              </p>
              <div className="rbt-info-wrapper d-flex justify-content-between mt--16">
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
                    <span className="rbt-offer-badge">
                      -{discountPercent}%
                    </span>
                  )}
                </div>
                <div className="prd-info-section has-left-separator">
                  <div className="prd-id-text">
                    <p className="text-bold">
                      {t("product.sku")}:
                    </p>
                    <p>
                      {selectedVariant.sku}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rbt-info-wrapper d-flex mt--16">
                <div className="rbt-card-rating mt--0">
                  <ul className="rbt-rating-icon-list">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <li key={index}>
                        <i className="fa-regular fa-star" />
                      </li>
                    ))}
                  </ul>
                  <p className="rating-digit">
                    (0)
                  </p>
                  <ProductCardTextSwiper />
                </div>
                <div className="prd-info-section has-left-separator">
                  <div
                    className={`rbt-badge rbt-badge-border rbt-badge-small rbt-badge-rounded ${
                      isOutOfStock ? "rbt-badge-bg-secondary-gradient" : "rbt-badge-bg-green"
                    }`}
                  >
                    {isOutOfStock ? t("common.outOfStock") : t("common.inStockCount").replace("{count}", String(selectedVariant.stock))}
                  </div>
                </div>
              </div>
              <div className="rbt-info-wrapper d-flex mt--8">
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
              {product.variantAxes.length > 0 && (
                <div className="rbt-info-wrapper d-flex mt--16">
                  <div className="prd-info-section w-100">
                    <VariantSelector product={product} selectedVariant={selectedVariant} onSelectVariant={handleSelectVariant} />
                  </div>
                </div>
              )}

              <div className="separator-top has-sm-spacer" />
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
                <button type="button" className="rbt-btn d-block text-center" disabled={isOutOfStock || isAddingSelected} onClick={handleBuyNow}>
                  Buy Now
                </button>
              </div>
              <div className="rbt-quick-link-grp mt--12">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
