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
            const categoryProducts = products.filter((product) => product.categoryId === category.id);
            // Use first product's first image as the category thumbnail; list a few real
            // products as quick links (the template shows fake subcategories here, we don't
            // have subcategory data, so real top products fill that spot instead)
            const thumbnail = categoryProducts[0]?.images[0];
            const quickLinks = categoryProducts.slice(0, 3);

            return (
              <div
                key={category.id}
                className="group flex items-start justify-between gap-3 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div className="min-w-0">
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-base font-semibold text-foreground transition-colors group-hover:text-primary"
                  >
                    {t(category.nameKey)}
                  </Link>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {quickLinks.map((product) => (
                      <li key={product.id}>
                        <Link
                          href={`/product/${product.slug}`}
                          className="truncate text-sm text-muted-foreground hover:text-primary"
                        >
                          {product.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/category/${category.slug}`}
                  className="flex flex-shrink-0 flex-col items-center gap-2"
                  aria-label={t(category.nameKey)}
                >
                  {thumbnail && (
                    <div className="relative size-14 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={thumbnail}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <span className="flex size-8 flex-shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowUpRight className="size-4" />
                  </span>
                </Link>
              </div>
            );
          })}
        </div>

        <Link
          href="/search"
          className="group flex flex-col justify-between rounded-2xl bg-green-50 p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-green-950/30"
        >
          <div>
            <p className="text-sm text-foreground/70">Weekend Deal</p>
            <h3 className="mt-2 text-xl leading-none font-medium text-foreground">
              <span className="font-bold">Smart Home</span> Bundle
            </h3>
            <p className="mt-2 leading-none font-bold text-primary">Super Holiday</p>
          </div>
          <div className="relative mx-auto mt-4 h-32 w-full">
            <Image
              src="/categories/banner-cat-01.webp"
              alt="Weekend deal"
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>
      </div>
    </section>
  );
}
