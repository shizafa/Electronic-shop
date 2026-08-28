"use client";

import Image from "next/image";
import { useState } from "react";
import type { Swiper as SwiperClass } from "swiper";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";

const MAIN_IMAGE_WIDTH = 1072;
const MAIN_IMAGE_HEIGHT = 824;
const MAIN_IMAGE_RATIO = { aspectRatio: `${MAIN_IMAGE_WIDTH} / ${MAIN_IMAGE_HEIGHT}` };

const THUMB_IMAGE_WIDTH = 120;
const THUMB_IMAGE_HEIGHT = 92;
const THUMB_IMAGE_RATIO = { aspectRatio: `${THUMB_IMAGE_WIDTH} / ${THUMB_IMAGE_HEIGHT}` };
const THUMB_GAP = 10;
const THUMB_RAIL_VISIBLE_COUNT = 5;
const THUMB_RAIL_HEIGHT =
  THUMB_RAIL_VISIBLE_COUNT * THUMB_IMAGE_HEIGHT + (THUMB_RAIL_VISIBLE_COUNT - 1) * THUMB_GAP;

interface ProductGalleryProps {
  images: string[];
  alt: string;
  badge?: string;
}

// Product-page media gallery. The main image is a real Swiper (nav arrows, touch/swipe —
// genuinely benefits from it). The thumbnail rail is a plain scrollable button list instead of
// a second, vertically-linked Swiper: slidesPerView="auto" in vertical mode proved unreliable
// across three attempts (slides collapsing to zero height, then overlapping, then a second
// slide not rendering at all) — a plain flex column with native overflow-y needs no
// client-side slide-measurement step and can't have that failure mode. Clicking a thumbnail
// calls the main Swiper's slideTo() directly instead of using the Thumbs module.
//
// The active-thumbnail highlight (opacity + border) is applied via inline style rather than
// the template's .swiper-slide-thumb-active class: that selector is compound
// (.swiper-slide-thumb-active.swiper-slide, confirmed in style.min.css) and requires the real
// Swiper-managed .swiper-slide class, which no longer applies now that this rail isn't a
// Swiper instance — adding that class without an actual Swiper context would just pull in
// swiper/css's own base .swiper-slide rules (flex-shrink, sizing) as an unwanted side effect,
// since that stylesheet is still imported once for the main image.
export function ProductGallery({ images, alt, badge }: ProductGalleryProps) {
  const [mainSwiper, setMainSwiper] = useState<SwiperClass | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevEl, setPrevEl] = useState<HTMLDivElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLDivElement | null>(null);

  const activeImage = images[activeIndex];

  return (
    <div className="rbt-single-product-media-area position-sticky-top rbt-single-product-media-has-folder-shape d-flex row row--12 rbt-gap--0">
      <div className="col-lg-1-5 col-lg-2 order-2 order-lg-1">
        <div
          className="product-single-slider-two-thumb-activation rbt-thumb-has-bg-shape-overlay d-flex flex-column"
          style={{ height: `${THUMB_RAIL_HEIGHT}px`, gap: `${THUMB_GAP}px`, overflowY: "auto" }}
        >
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              className="thumbnail d-block position-relative"
              aria-label={`${alt} ${index + 1}`}
              aria-current={index === activeIndex}
              onClick={() => mainSwiper?.slideTo(index)}
              style={{
                opacity: index === activeIndex ? 1 : 0.9,
                border: index === activeIndex ? "2px solid var(--color-primary)" : "2px solid transparent",
                flexShrink: 0,
              }}
            >
              <span className="rbt-thumb-img-sm">
                <Image
                  className="w-100"
                  src={image}
                  alt=""
                  width={THUMB_IMAGE_WIDTH}
                  height={THUMB_IMAGE_HEIGHT}
                  style={THUMB_IMAGE_RATIO}
                />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="col-lg-4-5 col-lg-10 order-1 order-lg-2">
        <Swiper
          className="rbt-medea-lg-img-area-md-wider product-single-slider-two-activation rbt-arrow-between rbt-arrow-show-dfl"
          modules={[Navigation]}
          onSwiper={setMainSwiper}
          navigation={{ prevEl, nextEl }}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          {badge && (
            <div slot="container-end" className="rbt-product-badge rbt-product-badge-bg-yellow rbt-badge-top-left--position">
              {badge}
            </div>
          )}

          {activeImage && (
            <a
              slot="container-end"
              className="rbt-enlarge-btn position-bottom-right"
              href={activeImage}
              target="_blank"
              rel="noreferrer"
            >
              <span className="rbt-icon">
                <i className="fa-regular fa-arrows-maximize" />
              </span>
              <span className="rbt-enlarge-text">
                Enlarge View
              </span>
            </a>
          )}

          {images.map((image, index) => (
            <SwiperSlide key={image} className={`rbt-scroll-trigger fade_in animation-order-${index + 1}`}>
              <div className="thumbnail">
                <div className="rbt-product-single-img">
                  <Image
                    className="w-100"
                    src={image}
                    alt={alt}
                    width={MAIN_IMAGE_WIDTH}
                    height={MAIN_IMAGE_HEIGHT}
                    style={MAIN_IMAGE_RATIO}
                    priority={index === 0}
                  />
                </div>
              </div>
            </SwiperSlide>
          ))}

          <div slot="container-end" ref={setPrevEl} className="rbt-swiper-arrow rbt-arrow-left">
            <div className="custom-overflow">
              <i className="rbt-icon fa-regular fa-arrow-left" />
              <i className="rbt-icon-top fa-regular fa-arrow-left" />
            </div>
          </div>
          <div slot="container-end" ref={setNextEl} className="rbt-swiper-arrow rbt-arrow-right">
            <div className="custom-overflow">
              <i className="rbt-icon fa-regular fa-arrow-right" />
              <i className="rbt-icon-top fa-regular fa-arrow-right" />
            </div>
          </div>
        </Swiper>
      </div>
    </div>
  );
}
