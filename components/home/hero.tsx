"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

const HERO_IMAGES = [
  "https://picsum.photos/seed/hero-electronics-1/1600/700",
  "https://picsum.photos/seed/hero-electronics-2/1600/700",
  "https://picsum.photos/seed/hero-electronics-3/1600/700",
  "https://picsum.photos/seed/hero-electronics-4/1600/700",
];

const ROTATION_INTERVAL_MS = 5500;

export function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((index) => (index + 1) % HERO_IMAGES.length);
    }, ROTATION_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="container-page py-8 sm:py-12">
      <div className="relative isolate flex h-[420px] items-end overflow-hidden rounded-2xl sm:h-[480px]">
        {HERO_IMAGES.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className={`absolute inset-0 object-cover transition-opacity duration-1000 ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

        <div className="relative z-10 flex w-full flex-col gap-4 p-6 sm:p-10">
          <div>
            <p className="text-sm font-semibold tracking-wide text-background/80 uppercase">
              {t("home.hero.eyebrow")}
            </p>
            <h1 className="mt-2 max-w-lg text-3xl font-semibold tracking-tight text-background sm:text-4xl">
              {t("home.hero.heading")}
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/category/air-conditioners">{t("home.hero.shopNow")}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-background/40 bg-background/10 text-background hover:bg-background/20 hover:text-background"
              asChild
            >
              <Link href="#categories">{t("home.hero.exploreCategories")}</Link>
            </Button>
          </div>

          <div className="flex gap-1.5 pt-2">
            {HERO_IMAGES.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`${t("home.hero.goToSlide")} ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? "w-6 bg-background" : "w-1.5 bg-background/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}