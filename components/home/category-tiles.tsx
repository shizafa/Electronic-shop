import Image from "next/image";
import Link from "next/link";
import { getAllCategories } from "@/lib/categories";
import { getAllProducts } from "@/lib/products";
import { t } from "@/lib/i18n";

// Homepage grid of category cards linking into /category/[slug]
export async function CategoryTiles() {
  const [categories, products] = await Promise.all([getAllCategories(), getAllProducts()]);

  return (
    <section id="categories" className="container-page py-10">
      <h2 className="text-xl font-semibold sm:text-2xl">{t("home.categories.heading")}</h2>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {categories.map((category) => {
          // Use first product's first image as the category thumbnail
          const thumbnail = products.find((product) => product.categoryId === category.id)?.images[0];

          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group relative flex h-48 items-end overflow-hidden rounded-xl border border-border bg-muted"
            >
              {thumbnail && (
                <Image
                  src={thumbnail}
                  alt={t(category.nameKey)}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/0 to-foreground/0" />
              <span className="relative z-10 p-4 text-base font-semibold text-background">
                {t(category.nameKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}