import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandLogos } from "@/components/home/brand-logos";
import { CategoryTiles } from "@/components/home/category-tiles";
import { GuaranteeStrip } from "@/components/home/guarantee-strip";
import { Hero } from "@/components/home/hero";
import { ProductSection } from "@/components/home/product-section";
import { PromoBanner } from "@/components/home/promo-banner";
import { TrustStrip } from "@/components/home/trust-strip";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { getAllCategories } from "@/lib/categories";
import { getAllProducts } from "@/lib/products";

// / route: homepage assembled from the various components/home/* sections
export default async function Home() {
  const [allProducts, categories] = await Promise.all([getAllProducts(), getAllCategories()]);
  const featuredProducts = allProducts.filter((product) => product.featured);
  // Show up to 8 non-featured products as "new arrivals"
  const newArrivals = allProducts.filter((product) => !product.featured).slice(0, 8);

  return (
    <>
      <Hero />
      <TrustStrip />
      <CategoryTiles />
      <ProductSection
        heading={t("home.newArrivals.heading")}
        products={newArrivals}
        badge={t("home.newArrivals.badge")}
        categories={categories}
      />
      <PromoBanner />
      <ProductSection
        heading={t("home.bestSellers.heading")}
        products={featuredProducts.slice(0, 8)}
        categories={categories}
      />

      <BrandLogos />

      <div className="container-page flex justify-center py-4">
        <Button size="lg" variant="outline" asChild>
          <Link href="/shop">
            {t("nav.showAllProducts")}
            <ArrowRight />
          </Link>
        </Button>
      </div>

      <GuaranteeStrip />
    </>
  );
}