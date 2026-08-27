"use client";

import Image from "next/image";
import { useState } from "react";
import type { Swiper as SwiperClass } from "swiper";
import { Navigation, Thumbs } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

const MAIN_IMAGE_WIDTH = 1072;
const MAIN_IMAGE_HEIGHT = 824;
const MAIN_IMAGE_RATIO = { aspectRatio: `${MAIN_IMAGE_WIDTH} / ${MAIN_IMAGE_HEIGHT}` };

const THUMB_IMAGE_WIDTH = 120;
const THUMB_IMAGE_HEIGHT = 92;

interface ProductGalleryProps {
  images: string[];
  alt: string;
  badge?: string;
}

// Product-page media gallery: a vertical thumbnail rail synced to the main image via Swiper's
// Thumbs module (real Swiper, per project rules — the template's own version used two
// jQuery-linked Swiper instances plus data-fancybox for the enlarge button; Fancybox is a
// jQuery plugin so it's dropped in favor of the same "open full image in a new tab" pattern
// the previous ImageGallery already used).
export function ProductGallery({ images, alt, badge }: ProductGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null);
  const [activeImage, setActiveImage] = useState(images[0]);
  // Swiper needs the arrow elements themselves, not refs, and must re-init when they
  // resolve — state (rather than useRef) is what makes that re-render happen.
  const [prevEl, setPrevEl] = useState<HTMLDivElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLDivElement | null>(null);

  return (
    <div className="rbt-single-product-media-area position-sticky-top rbt-single-product-media-has-folder-shape d-flex row row--12 rbt-gap--0">
      <div className="col-lg-1-5 col-lg-2 order-2 order-lg-1">
        <Swiper
          className="product-single-slider-two-thumb-activation rbt-arrow-show-dfl rbt-thumb-has-bg-shape-overlay rbt-swiper-right-bottom-one rbt-arrow-between rbt-swiper-arrow-transparent"
          modules={[Thumbs]}
          onSwiper={setThumbsSwiper}
          direction="vertical"
          slidesPerView={5}
          spaceBetween={12}
          watchSlidesProgress
        >
          {images.map((image, index) => (
            <SwiperSlide key={image} className={`rbt-scroll-trigger fade_in animation-order-${index + 1}`}>
              <button className="thumbnail d-block position-relative" type="button" aria-label={`${alt} ${index + 1}`}>
                <span className="rbt-thumb-img-sm">
                  <Image
                    className="w-100"
                    src={image}
                    alt=""
                    width={THUMB_IMAGE_WIDTH}
                    height={THUMB_IMAGE_HEIGHT}
                    style={MAIN_IMAGE_RATIO}
                  />
                </span>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="col-lg-4-5 col-lg-10 order-1 order-lg-2">
        <Swiper
          className="rbt-medea-lg-img-area-md-wider product-single-slider-two-activation rbt-arrow-between rbt-arrow-show-dfl"
          modules={[Navigation, Thumbs]}
          thumbs={{ swiper: thumbsSwiper }}
          navigation={{ prevEl, nextEl }}
          onSlideChange={(swiper) => setActiveImage(images[swiper.activeIndex])}
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
