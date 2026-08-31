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
import { useCart } from "@/context/cart-context";
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

// Every value in the pasted markup with no field behind it yet. "20 people are viewing this"
// is kept as static decoration rather than dropped — same explicit call product-detail.tsx's
// own PLACEHOLDER block already made for the identical claim.
// TODO: wire to backend
const PLACEHOLDER = {
  viewingNow: "20 people are viewing this",
};

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

  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();

  const inWishlist = isInWishlist(product.id, selectedVariant.id);
  const inCompare = isInCompare(product.id);
  const isOutOfStock = selectedVariant.stock === 0;
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

  function handleBuyNow() {
    addToCart(product.id, selectedVariant.id, quantity);
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
              <div className="rbt-info-wrapper d-flex mt--16 rbt-gap--8 flex-wrap">
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
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                >
                  <i className="fa-regular fa-cart-shopping" />
                  {t("common.addToCart")}
                </button>
              </div>
              <div className="prd-btn-grp">
                <button type="button" className="rbt-btn d-block text-center" disabled={isOutOfStock} onClick={handleBuyNow}>
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
