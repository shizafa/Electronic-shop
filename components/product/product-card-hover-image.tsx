"use client";

import Image from "next/image";
import { type CSSProperties, useEffect, useRef, useState } from "react";

interface ProductCardHoverImageProps {
  src: string;
  hoverSrc: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  style: CSSProperties;
  priority: boolean;
}

// Owns both images inside .rbt-card-img so the hover image can be deferred.
//
// Lazy loading is geometric, not visual: the template hides .rbt-hover-img with
// opacity/visibility rather than display:none, so it still intersects the viewport and
// above-the-fold cards fetch BOTH images on load despite loading="lazy". This mounts the
// hover image only on the first pointer/focus interaction with the card, then keeps it
// mounted — so once hovered, the DOM is identical to rendering both up front.
//
// The listener binds to the whole .rbt-card rather than to this element because the
// template's `.rbt-card-img.rbt-has-hover-img:hover .rbt-prd-img { opacity:0; visibility:hidden }`
// hides the main image on hover — including when hovering the badges or quick buttons.
// Binding to the larger card element gives the hover image a head start, so that rule can
// never leave a blank box behind.
export function ProductCardHoverImage({ src, hoverSrc, alt, width, height, sizes, style, priority }: ProductCardHoverImageProps) {
  const [hoverImageMounted, setHoverImageMounted] = useState(false);
  const mainImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (hoverImageMounted) return;
    const card = mainImageRef.current?.closest(".rbt-card") ?? mainImageRef.current?.parentElement;
    if (!card) return;

    const mount = () => setHoverImageMounted(true);
    card.addEventListener("pointerenter", mount, { once: true });
    card.addEventListener("focusin", mount, { once: true });

    return () => {
      card.removeEventListener("pointerenter", mount);
      card.removeEventListener("focusin", mount);
    };
  }, [hoverImageMounted]);

  return (
    <>
          <Image ref={mainImageRef} className="rbt-prd-img" src={src} alt={alt} width={width} height={height} sizes={sizes} priority={priority} style={style} />
          {hoverImageMounted && (
            <Image className="rbt-hover-img" src={hoverSrc} alt={alt} width={width} height={height} sizes={sizes} style={style} />
          )}
    </>
  );
}
