"use client";

import { useEffect, useState } from "react";
import { DealsOfTheDay } from "@/components/home/deals-of-the-day";
import { loadDealsOfTheDay, type DealsOfTheDayData } from "@/components/home/deals-of-the-day-loader";
import { DealsOfTheDaySkeleton } from "@/components/home/deals-of-the-day-skeleton";
import { useInViewOnce } from "@/components/ui/use-in-view-once";

// Below-the-fold: fetch only starts once this scrolls near the viewport, not on page load.
export function DealsOfTheDayLazy() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const [loadError, setLoadError] = useState(false);
  const [data, setData] = useState<DealsOfTheDayData | null>(null);

  useEffect(() => {
    if (!inView || data) return;
    let cancelled = false;
    loadDealsOfTheDay()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [inView, data]);

  // Decorative homepage section — on a failed load, leave it out rather than show a skeleton forever
  if (loadError) return null;

  if (data) return <DealsOfTheDay products={data.products} categories={data.categories} />;

  return (
    <div ref={ref}>
      <DealsOfTheDaySkeleton />
    </div>
  );
}
