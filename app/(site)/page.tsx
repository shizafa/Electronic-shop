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
          className="h-auto gap-[clamp(5px,0.8vw,10px)] rounded-full px-[clamp(20px,3vw+8px,44px)] py-[clamp(10px,1.4vw+4px,18px)] text-[clamp(14px,0.8vw+9px,20px)] hover:text-white! [&_svg]:size-[clamp(20px,2.4vw,30px)]"
          asChild
        >
          <Link href="/shop">
            {t("nav.showAllProducts")}
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </>
  );
}