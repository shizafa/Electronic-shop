"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { t } from "@/lib/i18n";

interface ImageGalleryProps {
  images: string[];
  alt: string;
  badge?: string;
}

// Main product image with left/right nav and clickable thumbnails, shown on the product page.
export function ImageGallery({ images, alt, badge }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  function showPrevious() {
    // adding images.length before % wraps negative indexes back to the end of the array
    setActiveIndex((index) => (index - 1 + images.length) % images.length);
  }

  function showNext() {
    setActiveIndex((index) => (index + 1) % images.length); // wraps back to the first image
  }

  return (
    <div className="flex gap-3">
      {images.length > 1 && (
        <div className="flex w-16 shrink-0 flex-col gap-2 sm:w-20">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-square shrink-0 overflow-hidden rounded-lg border-2 ${
                index === activeIndex ? "border-primary" : "border-transparent"
              }`}
            >
              <Image src={image} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-square flex-1 overflow-hidden rounded-2xl bg-muted">
        {activeImage && (
          <Image
            src={activeImage}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
            priority
          />
        )}

        {badge && (
          <span className="absolute top-3 left-3 rounded-full bg-destructive px-2.5 py-1 text-[11px] font-bold text-white uppercase">
            {badge}
          </span>
        )}

        {activeImage && (
          <a
            href={activeImage}
            target="_blank"
            rel="noreferrer"
            aria-label={t("product.viewFullImage")}
            className="absolute right-3 bottom-3 flex size-9 items-center justify-center rounded-lg bg-background/90 shadow-sm hover:bg-background"
          >
            <Maximize2 className="size-4" />
          </a>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label={t("product.previousImage")}
              className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-sm hover:bg-background"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label={t("product.nextImage")}
              className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 shadow-sm hover:bg-background"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
