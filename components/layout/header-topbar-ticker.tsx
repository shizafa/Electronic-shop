"use client";

import Link from "next/link";
import { useState } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";

export interface TopbarTickerSlide {
  text: string;
  linkLabel: string;
  href: string;
}

// Vertical "Trending Now" ticker in the header topbar. Same template geometry as the
// product card's ticker (.rbt-text-swiper-container is a fixed-height overflow:hidden box
// with 20px slides), so Swiper only has to move the wrapper.
//
// The arrows are bound through state rather than refs because Swiper needs the elements
// themselves and must re-init once they resolve.
export function HeaderTopbarTicker({ slides }: { slides: TopbarTickerSlide[] }) {
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
              {slides.map((slide) => (
                <SwiperSlide key={slide.text}>
                  {slide.text}
                  <Link className="rbt-fancy-link ml--4" href={slide.href}>
                    {slide.linkLabel}
                  </Link>
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
