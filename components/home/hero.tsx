"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Button } from "@/components/ui/button";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type HeroSlide = {
  image: string;
  cardClassName: string;
  eyebrow: string;
  titleBold: string;
  titleRest: string;
  originalPrice: string;
  salePrice: string;
  discountLabel: string;
  href: string;
};

const HERO_SLIDES: HeroSlide[] = [
  {
    image: "/hero/product-banner-img-17.webp",
    cardClassName: "bg-amber-50",
    eyebrow: "Exclusive Offer Going",
    titleBold: "GOPRO",
    titleRest: "HERO 10",
    originalPrice: "$295.00",
    salePrice: "$189.00",
    discountLabel: "Save 30%",
    href: "/search",
  },
  {
    image: "/hero/product-banner-img-18.webp",
    cardClassName: "bg-blue-50",
    eyebrow: "Limited Weekend Deal",
    titleBold: "OSMO MINI",
    titleRest: "PRO",
    originalPrice: "$295.00",
    salePrice: "$249.00",
    discountLabel: "Save 30%",
    href: "/search",
  },
  {
    image: "/hero/product-banner-img-20.webp",
    cardClassName: "bg-rose-50",
    eyebrow: "Limited Weekend Deal",
    titleBold: "AIRPODS",
    titleRest: "PRO",
    originalPrice: "$295.00",
    salePrice: "$179.98",
    discountLabel: "Save 30%",
    href: "/search",
  },
  {
    image: "/hero/product-banner-img-19.webp",
    cardClassName: "bg-emerald-50",
    eyebrow: "Exclusive Offer Going",
    titleBold: "DSLR",
    titleRest: "PERFORS",
    originalPrice: "$295.00",
    salePrice: "$179.98",
    discountLabel: "Save 30%",
    href: "/search",
  },
  {
    image: "/hero/product-banner-img-21.webp",
    cardClassName: "bg-violet-50",
    eyebrow: "Exclusive Offer Going",
    titleBold: "IPAD",
    titleRest: "PRO M1",
    originalPrice: "$295.00",
    salePrice: "$179.98",
    discountLabel: "Save 30%",
    href: "/search",
  },
  {
    image: "/hero/product-banner-img-22.webp",
    cardClassName: "bg-slate-100",
    eyebrow: "Limited Weekend Deal",
    titleBold: "MACBOOK",
    titleRest: "PRO M1",
    originalPrice: "$295.00",
    salePrice: "$179.98",
    discountLabel: "Save 30%",
    href: "/search",
  },
];

// Homepage hero banner: rotating product spotlights with pricing and a shop-now CTA
export function Hero() {
  return (
    <section className="container-page py-8 sm:py-12">
      <div className="relative isolate px-12">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          autoplay={{ delay: 5500, disableOnInteraction: false }}
          loop
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{ 768: { slidesPerView: 2 } }}
          navigation={{ prevEl: ".hero-arrow-prev", nextEl: ".hero-arrow-next" }}
          pagination={{ clickable: true, el: ".hero-pagination" }}
        >
          {HERO_SLIDES.map((slide) => (
            <SwiperSlide key={slide.image}>
              <div
                className={`relative aspect-[4/3] overflow-hidden rounded-2xl sm:aspect-[11/8] ${slide.cardClassName}`}
              >
                <Image
                  src={slide.image}
                  alt={`${slide.titleBold} ${slide.titleRest}`}
                  fill
                  priority
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover mix-blend-multiply"
                />

                <div className="relative z-10 flex h-full max-w-[65%] flex-col justify-center gap-3 p-6 sm:p-10">
                  <p className="text-sm font-medium tracking-wide text-foreground/60 uppercase">
                    {slide.eyebrow}
                  </p>
                  <h2 className="text-2xl leading-tight font-semibold tracking-tight text-foreground sm:text-3xl">
                    <span className="font-extrabold">{slide.titleBold}</span> {slide.titleRest}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <del className="text-sm text-foreground/50">{slide.originalPrice}</del>
                    <span className="text-xl font-bold text-primary sm:text-2xl">{slide.salePrice}</span>
                    <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                      {slide.discountLabel}
                    </span>
                  </div>
                  <Button
                    className="mt-2 flex size-[84px] flex-col items-center justify-center gap-0.5 rounded-full p-0 text-xs leading-tight font-bold uppercase"
                    asChild
                  >
                    <Link href={slide.href}>
                      <ArrowUpRight className="mb-0.5 size-3.5" />
                      Shop
                      <br />
                      Now
                    </Link>
                  </Button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          type="button"
          aria-label="Previous slide"
          className="hero-arrow-prev absolute top-1/2 left-0 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-foreground shadow-sm hover:bg-muted/70"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          className="hero-arrow-next absolute top-1/2 right-0 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-muted text-foreground shadow-sm hover:bg-muted/70"
        >
          <ChevronRight className="size-4" />
        </button>

        <div className="hero-pagination mt-5 flex justify-center gap-1.5 [&_.swiper-pagination-bullet]:h-1.5 [&_.swiper-pagination-bullet]:w-1.5 [&_.swiper-pagination-bullet]:rounded-full [&_.swiper-pagination-bullet]:bg-foreground/20 [&_.swiper-pagination-bullet]:transition-all [&_.swiper-pagination-bullet-active]:w-6 [&_.swiper-pagination-bullet-active]:bg-primary" />
      </div>
    </section>
  );
}
