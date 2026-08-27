import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandLogos } from "@/components/home/brand-logos";
import { CategoryTiles } from "@/components/home/category-tiles";
import { DealsOfTheDay } from "@/components/home/deals-of-the-day";
import { Hero } from "@/components/home/hero";
import { PromoBanner } from "@/components/home/promo-banner";
import { WeekHighlights } from "@/components/home/week-highlights";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { getAllCategories } from "@/lib/categories";
import { getAllProducts } from "@/lib/products";

// / route: homepage assembled from the various components/home/* sections
export default async function Home() {
  const [allProducts, categories] = await Promise.all([getAllProducts(), getAllCategories()]);
  const featuredProducts = allProducts.filter((product) => product.featured);

  return (
    <>
      <Hero />
      <CategoryTiles />
      <DealsOfTheDay products={allProducts} categories={categories} />
      <PromoBanner />
      <WeekHighlights products={featuredProducts} />

      <BrandLogos />

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