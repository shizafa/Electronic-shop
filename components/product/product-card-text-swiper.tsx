"use client";

import { useState } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";

// Vertical text ticker from the template's product card (policy strip under the rating).
//
// The template's "90+ Sold Recently" slide is intentionally absent: it is a sales claim
// with no field behind it. The two remaining slides are store policy copy, not per-product
// data, so they stay hardcoded here until there is somewhere real to read them from.

// TODO: wire to backend
const PLACEHOLDER = {
  slides: [
    { icon: "fa-solid fa-truck", text: "Free shipping" },
    { icon: "fa-solid fa-rotate-left", text: "7 Days Return Plicy" },
  ],
};

export function ProductCardTextSwiper() {
  // Swiper needs the arrow elements themselves, not refs, and must re-init when they
  // resolve — state (rather than useRef) is what makes that re-render happen.
  const [prevEl, setPrevEl] = useState<HTMLDivElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLDivElement | null>(null);

  return (
    <Swiper
      className="rbt-text-swiper-container rbt-arrow-vertical"
      modules={[Navigation]}
      direction="vertical"
      slidesPerView={1}
      loop
      navigation={{ prevEl, nextEl }}
    >
      {PLACEHOLDER.slides.map((slide) => (
        <SwiperSlide key={slide.text}>
          <div className="rbt-text-group">
            <span className="icon mr--4">
              <i className={slide.icon} />
            </span>
            {slide.text}
          </div>
        </SwiperSlide>
      ))}
      <div slot="container-end" ref={setPrevEl} className="rbt-verticle-arrow rbt-arrow-prev">
        <i className="fa-regular fa-chevron-up" />
      </div>
      <div slot="container-end" ref={setNextEl} className="rbt-verticle-arrow rbt-arrow-next">
        <i className="fa-regular fa-chevron-down" />
      </div>
    </Swiper>
  );
}
