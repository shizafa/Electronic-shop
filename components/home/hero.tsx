"use client";

import { useState } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { PromoBannerMagneticButton } from "@/components/home/promo-banner-magnetic-button";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type HeroSlide = {
  image: string;
  fadeOrder: number;
  zoomOrder: number;
  curved: boolean;
  eyebrow: string;
  titleBold: string;
  titleRest: string;
  salePrice: string;
};

// Homepage hero banner slides — unbacked marketing content, same as PromoBanner and
// CategoryTiles: no campaign/promotions data model exists yet.
// TODO: wire to a real source once one exists.
const HERO_SLIDES: HeroSlide[] = [
  {
    image: "/hero/product-banner-img-17.webp",
    fadeOrder: 1,
    zoomOrder: 1,
    curved: false,
    eyebrow: "Exclusive Offer Going",
    titleBold: "GOPRO",
    titleRest: "HERO 10",
    salePrice: "$189.00",
  },
  {
    image: "/hero/product-banner-img-18.webp",
    fadeOrder: 2,
    zoomOrder: 2,
    curved: true,
    eyebrow: "Limited Weekend Deal",
    titleBold: "OSMO MINI",
    titleRest: "PRO",
    salePrice: "$249.00",
  },
  {
    image: "/hero/product-banner-img-20.webp",
    fadeOrder: 3,
    zoomOrder: 4,
    curved: false,
    eyebrow: "Limited Weekend Deal",
    titleBold: "AIRPODS",
    titleRest: "PRO",
    salePrice: "$179.98",
  },
  {
    image: "/hero/product-banner-img-19.webp",
    fadeOrder: 4,
    zoomOrder: 3,
    curved: true,
    eyebrow: "Exclusive Offer Going",
    titleBold: "DSLR",
    titleRest: "PERFORS",
    salePrice: "$179.98",
  },
  {
    image: "/hero/product-banner-img-21.webp",
    fadeOrder: 3,
    zoomOrder: 3,
    curved: false,
    eyebrow: "Exclusive Offer Going",
    titleBold: "IPAD",
    titleRest: "PRO M1",
    salePrice: "$179.98",
  },
  {
    image: "/hero/product-banner-img-22.webp",
    fadeOrder: 4,
    zoomOrder: 4,
    curved: true,
    eyebrow: "Limited Weekend Deal",
    titleBold: "MACBOOK",
    titleRest: "PRO M1",
    salePrice: "$179.98",
  },
];

export function Hero() {
  // Swiper needs the arrow/pagination elements themselves, not refs, and must re-init when
  // they resolve — state (rather than useRef) is what makes that re-render happen.
  const [prevEl, setPrevEl] = useState<HTMLDivElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLDivElement | null>(null);
  const [paginationEl, setPaginationEl] = useState<HTMLDivElement | null>(null);
  // The template's CSS hides arrows/pagination (visibility:hidden) until an
  // `is-swiper-ready` class lands on the container — main.min.js added that class once its
  // vanilla Swiper instance finished initializing. We add it the same way, once React's
  // Swiper instance is ready, instead of rendering it unconditionally.
  const [isReady, setIsReady] = useState(false);

  return (
    <>
      <h1 className="visually-hidden">
        Home Electronics
      </h1>
      {/* Start Component Area */}
      <div className="rbt-component-area rbt-product-banner-area rbt-section-gap2 rbt-bg-color-gray-light rbt-elctro-hero-banner">
        <div className="container">
          {/* Start Product Banner Area */}
          <div className="row row--12 mt_dec--24">
            <div className="col-lg-12 col-md-12 col-sm-12 col-12 mt--24 d-flex justify-content-center">
              <div className={`rbt-swiper-container-one rbt-arrow-between${isReady ? " is-swiper-ready" : ""}`}>
                <Swiper
                  className="rbt-hero-banner-activation-1 rbt-dot-bottom-center rbt-slideshow-content-inner"
                  modules={[Autoplay, Navigation, Pagination]}
                  autoplay={{ delay: 5000, disableOnInteraction: false }}
                  loop
                  slidesPerView={1}
                  spaceBetween={24}
                  breakpoints={{ 768: { slidesPerView: 2 } }}
                  navigation={{ prevEl, nextEl }}
                  pagination={{ el: paginationEl, clickable: true }}
                  onSwiper={() => setIsReady(true)}
                >
                  {HERO_SLIDES.map((slide) => (
                    <SwiperSlide key={slide.image}>
                      <div
                        className={`rbt-product-banner rbt-product-banner-style-four rbt-banner-four-var-one rbt-curved-style-box rbt-scroll-trigger fade_in animation-order-${slide.fadeOrder}${slide.curved ? " rbt-curved-style-box-2" : ""}`}
                      >
                        <div className="rbt-banner-inner">
                          <div className={`rbt-product-banner-img rbt-full-width-img rbt-scroll-trigger zoom_in animation-order-${slide.zoomOrder}`}>
                            <img src={slide.image} alt="Ecommerce Product Banner Image" />
                          </div>
                          <div className="rbt-product-banner-content">
                            <div className="rbt-content-section">
                              <p className="rbt-banner-subtitle mb-0">
                                {slide.eyebrow}
                              </p>
                              <h2 className="rbt-banner-title rbt-banner-title-lg mb-0">
                                <span className="rbt-bold--text">
                                  {slide.titleBold}
                                </span>
                                {slide.titleRest}
                              </h2>
                              <div className="rbt-pricing-part">
                                <del className="rbt-dis-price-text">
                                  $295.00
                                </del>
                                <span className="d-flex align-items-center rbt-gap--8">
                                  <span className="rbt-price-text offer-price">
                                    {slide.salePrice}
                                  </span>
                                  <span className="rbt-offer-badge">
                                    Save 30%
                                  </span>
                                </span>
                              </div>
                              <div className="rbt-banner-btn">
                                <PromoBannerMagneticButton href="/shop" />
                              </div>
                            </div>
                          </div>
                        </div>
                        {slide.curved && (
                          <div className="rbt-curved-portion rbt-right-corner-portion">
                            <div className="rbt-wrapper" />
                          </div>
                        )}
                      </div>
                    </SwiperSlide>
                  ))}
                  <div slot="container-end" ref={setPaginationEl} className="rbt-swiper-pagination rbt-swiper-pagination-var-one" />
                  <div slot="container-end" ref={setPrevEl} className="rbt-swiper-arrow rbt-arrow-left rbt-arrow-gray rbt-arrow-lg">
                    <div className="custom-overflow">
                      <i className="rbt-icon fa-regular fa-arrow-left" />
                      <i className="rbt-icon-top fa-regular fa-arrow-left" />
                    </div>
                  </div>
                  <div slot="container-end" ref={setNextEl} className="rbt-swiper-arrow rbt-arrow-right rbt-arrow-gray rbt-arrow-lg">
                    <div className="custom-overflow">
                      <i className="rbt-icon fa-regular fa-arrow-right" />
                      <i className="rbt-icon-top fa-regular fa-arrow-right" />
                    </div>
                  </div>
                </Swiper>
              </div>
            </div>
          </div>
          {/* End Product Banner Area */}
        </div>
      </div>
      {/* End Component Area */}
    </>
  );
}
