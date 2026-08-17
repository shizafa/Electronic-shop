import { AnnouncementBar } from "@/components/home/announcement-bar";
import { CategoryTiles } from "@/components/home/category-tiles";
import { GuaranteeStrip } from "@/components/home/guarantee-strip";
import { Hero } from "@/components/home/hero";
import { ProductSection } from "@/components/home/product-section";
import { PromoBanner } from "@/components/home/promo-banner";
import { TrustStrip } from "@/components/home/trust-strip";
import { t } from "@/lib/i18n";
import { getAllProducts, getFeaturedProducts } from "@/lib/products";

export default function Home() {
  const featuredProducts = getFeaturedProducts();
  const newArrivals = getAllProducts()
    .filter((product) => !product.featured)
    .slice(0, 8);

  return (
    <>
      <AnnouncementBar />
      <Hero />
      <TrustStrip />
      <CategoryTiles />
      <ProductSection
        heading={t("home.newArrivals.heading")}
        products={newArrivals}
        badge={t("home.newArrivals.badge")}
      />
      <PromoBanner />
      <ProductSection heading={t("home.bestSellers.heading")} products={featuredProducts.slice(0, 8)} />
      <GuaranteeStrip />
    </>
  );
}