import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/product/price";
import { getFeaturedProducts, getDisplayVariant } from "@/lib/products";
import { t } from "@/lib/i18n";

export function Hero() {
  const spotlightProducts = getFeaturedProducts().slice(0, 3);

  return (
    <section className="container-page py-8 sm:py-12">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted to-background px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
        <div className="max-w-xl">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            {t("home.hero.eyebrow")}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t("home.hero.heading")}
          </h1>
          <p className="mt-4 max-w-md text-base text-muted-foreground">{t("home.hero.subheading")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/category/air-conditioners">{t("home.hero.shopNow")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#categories">{t("home.hero.exploreCategories")}</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3 lg:absolute lg:top-12 lg:right-12 lg:mt-0 lg:max-w-xs lg:flex-col">
          {spotlightProducts.map((product) => {
            const displayVariant = getDisplayVariant(product);
            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="flex w-44 items-center gap-2 rounded-xl border border-border bg-background/90 p-2 shadow-sm backdrop-blur-sm"
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">{product.name}</p>
                  <Price price={displayVariant.price} className="text-xs" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}