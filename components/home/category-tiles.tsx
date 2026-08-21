import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllCategories } from "@/lib/categories";
import { getAllProducts } from "@/lib/products";
import { t } from "@/lib/i18n";

// Homepage grid of category cards linking into /category/[slug]
export async function CategoryTiles() {
  const [categories, products] = await Promise.all([getAllCategories(), getAllProducts()]);

  return (
    <section id="categories" className="container-page py-10">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold sm:text-2xl">{t("home.categories.heading")}</h2>
        <Link
          href="/search"
          className="flex items-center gap-1 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary hover:bg-primary/15"
        >
          View All Categories
          <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 rounded-3xl bg-muted/40 p-4 sm:p-6 lg:grid-cols-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3">
          {categories.map((category) => {
            // Use first product's first image as the category thumbnail; count all products in this category
            const categoryProducts = products.filter((product) => product.categoryId === category.id);
            const thumbnail = categoryProducts[0]?.images[0];

            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <div>
                  <h3 className="text-base font-semibold text-foreground">{t(category.nameKey)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{categoryProducts.length} products</p>
                </div>

                <div className="flex flex-shrink-0 items-center gap-3">
                  {thumbnail && (
                    <div className="relative size-14 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={thumbnail}
                        alt={t(category.nameKey)}
                        fill
                        sizes="56px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <span className="flex size-8 flex-shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <Link
          href="/search"
          className="flex flex-col justify-between rounded-2xl bg-green-50 p-7 text-center dark:bg-green-950/30"
        >
          <div>
            <p className="text-sm text-foreground/70">Weekend Deal</p>
            <h3 className="mt-2 text-xl leading-none font-medium text-foreground">
              <span className="font-bold">Smart Home</span> Bundle
            </h3>
            <p className="mt-2 leading-none font-bold text-primary">Super Holiday</p>
          </div>
          <div className="relative mx-auto mt-4 h-32 w-full">
            <Image src="/categories/banner-cat-01.webp" alt="Weekend deal" fill className="object-contain" />
          </div>
        </Link>
      </div>
    </section>
  );
}
