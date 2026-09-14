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
        <Button
          size="lg"
          className="h-auto gap-[clamp(5px,0.6vw,8px)] rounded-full px-[clamp(20px,2vw+8px,34px)] py-[clamp(9px,0.8vw+4px,14px)] text-[clamp(14px,0.5vw+10px,17px)] text-white! hover:-translate-y-0.5 hover:shadow-lg"
          asChild
        >
          <Link href="/shop">
            {t("nav.showAllProducts")}
            <ArrowRight className="size-[1.2em]" />
          </Link>
        </Button>
      </div>
    </>
  );
}