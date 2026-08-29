"use client";

import { useState } from "react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

const SLIDES = [
  "/assets/images/about/about-image-1.webp",
  "/assets/images/about/about-mobile-a-02.webp",
  "/assets/images/about/about-mobile-a-03.webp",
  "/assets/images/about/about-mobile-a-01.webp",
];

// Rebuilds main.min.js's rbtSwiperActive() config for .rbt-about-banner-slide-acivation
// (spaceBetween: 24, slidesPerView: 1, loop, autoplay delay 4000, clickable pagination dots)
// since that init is jQuery-driven and jQuery plugins aren't loaded in this project.
export function AboutBannerSlider() {
  const [paginationEl, setPaginationEl] = useState<HTMLDivElement | null>(null);

  return (
    <Swiper
      className="rbt-about-banner-slide-acivation"
      modules={[Autoplay, Pagination]}
      spaceBetween={24}
      slidesPerView={1}
      loop
      autoplay={{ delay: 4000 }}
      pagination={{ el: paginationEl, clickable: true }}
    >
      {SLIDES.map((image) => (
        <SwiperSlide key={image}>
          <div className="rbt-about-banner-img">
            <img src={image} alt="About us image" />
          </div>
        </SwiperSlide>
      ))}
      <div
        slot="container-end"
        ref={setPaginationEl}
        className="swiper-pagination rbt-swiper-progress rbt-swiper-pagination-dot-extend"
      />
    </Swiper>
  );
}
