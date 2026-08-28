"use client";

import { useEffect, useState } from "react";
import { BrandLogos, type BrandTile } from "@/components/home/brand-logos";
import { loadBrandLogos } from "@/components/home/brand-logos-loader";
import { BrandLogosSkeleton } from "@/components/home/brand-logos-skeleton";
import { useInViewOnce } from "@/components/ui/use-in-view-once";

// Below-the-fold: fetch only starts once this scrolls near the viewport, not on page load.
export function BrandLogosLazy() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const [brands, setBrands] = useState<BrandTile[] | null>(null);

  useEffect(() => {
    if (!inView || brands) return;
    let cancelled = false;
    loadBrandLogos().then((data) => {
      if (!cancelled) setBrands(data);
    });
    return () => {
      cancelled = true;
    };
  }, [inView, brands]);

  if (brands) return <BrandLogos brands={brands} />;

  return (
    <div ref={ref}>
      <BrandLogosSkeleton />
    </div>
  );
}
