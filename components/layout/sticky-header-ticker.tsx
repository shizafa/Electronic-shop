"use client";

import Link from "next/link";
import { useState } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";

// Campaign strip above the sticky nav. The pasted markup gave one promo line plus a
// comment ("2 more identical .swiper-slide promo lines") — rendering that text three times
// would be inventing filler, so this is one real slide, PLACEHOLDER-flagged like the other
// unbacked promo copy in nav-menu.tsx.
// TODO: wire to backend
const PLACEHOLDER = {
  slides: [{ text: "Top products. Better prices -under $100.", linkLabel: "Shop Now", href: "/shop" }],
};

export function StickyHeaderTicker() {
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
                    <div className="rbt-fancy-item fancy-menu-text fancy-menu-center">
                      <p className="rbt-fancy-text rbt-text-color-white">
                        {slide.text}
                        <Link className="rbt-text-color-white" href={slide.href}>
                          {slide.linkLabel}
                        </Link>
                      </p>
                    </div>
                  </SwiperSlide>
                ))}
                <div slot="container-end" ref={setPrevEl} className="rbt-verticle-arrow rbt-text-color-white rbt-arrow-prev">
                  <i className="fa-regular fa-chevron-up" />
                </div>
                <div slot="container-end" ref={setNextEl} className="rbt-verticle-arrow rbt-text-color-white rbt-arrow-next">
                  <i className="fa-regular fa-chevron-down" />
                </div>
              </Swiper>
  );
}
