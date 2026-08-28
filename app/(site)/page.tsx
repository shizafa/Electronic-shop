import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { BrandLogosLazy } from "@/components/home/brand-logos-lazy";
import { CategoryTiles } from "@/components/home/category-tiles";
import { CategoryTilesSkeleton } from "@/components/home/category-tiles-skeleton";
import { DealsOfTheDayLazy } from "@/components/home/deals-of-the-day-lazy";
import { Hero } from "@/components/home/hero";
import { PromoBanner } from "@/components/home/promo-banner";
import { WeekHighlightsLazy } from "@/components/home/week-highlights-lazy";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

// / route: homepage assembled from the various components/home/* sections. Each section below
// fetches its own data independently (CategoryTiles inline via Suspense; the rest deferred
// until scrolled near, via their *Lazy wrappers) instead of one page-level fetch blocking
// everything.
export default function Home() {
  return (
    <>
      <Hero />
      <Suspense fallback={<CategoryTilesSkeleton />}>
        <CategoryTiles />
      </Suspense>
      <DealsOfTheDayLazy />
      <PromoBanner />
      <WeekHighlightsLazy />

      <BrandLogosLazy />

      <div className="container-page flex justify-center py-4">
        <Button size="lg" className="h-auto rounded-full px-6 py-2.5 text-sm" asChild>
          <Link href="/shop">
            {t("nav.showAllProducts")}
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </>
  );
}