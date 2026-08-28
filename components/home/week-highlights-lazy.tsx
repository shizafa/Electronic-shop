"use client";

import { useEffect, useState } from "react";
import { WeekHighlights } from "@/components/home/week-highlights";
import { loadWeekHighlights } from "@/components/home/week-highlights-loader";
import { WeekHighlightsSkeleton } from "@/components/home/week-highlights-skeleton";
import { useInViewOnce } from "@/components/ui/use-in-view-once";
import type { Product } from "@/types/product";

// Below-the-fold: fetch only starts once this scrolls near the viewport, not on page load.
export function WeekHighlightsLazy() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    if (!inView || products) return;
    let cancelled = false;
    loadWeekHighlights().then((result) => {
      if (!cancelled) setProducts(result);
    });
    return () => {
      cancelled = true;
    };
  }, [inView, products]);

  if (products) return <WeekHighlights products={products} />;

  return (
    <div ref={ref}>
      <WeekHighlightsSkeleton />
    </div>
  );
}
