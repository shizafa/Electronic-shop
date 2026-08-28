import type { Metadata } from "next";
import { ProductCard } from "@/components/product/product-card";
import { ProductGrid } from "@/components/product/product-grid";
import { getAllCategories } from "@/lib/categories";
import { t } from "@/lib/i18n";
import { getAllProducts } from "@/lib/products";
import { getDisplayVariant } from "@/lib/product-helpers";

export const metadata: Metadata = {
  title: t("deals.title"),
};

// /deals route: featured products and anything with a live discount (variant.compareAtPrice)
export default async function DealsPage() {
  const [allProducts, categories] = await Promise.all([getAllProducts(), getAllCategories()]);
  const deals = allProducts.filter(
    (product) => product.featured || getDisplayVariant(product)?.compareAtPrice !== undefined
  );

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("deals.title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("deals.subtitle")}</p>

      {deals.length > 0 ? (
        <div className="mt-8">
          <ProductGrid>
            {deals.map((product) => {
              const category = categories.find((candidate) => candidate.id === product.categoryId);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={category?.name}
                />
              );
            })}
          </ProductGrid>
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">{t("deals.empty")}</p>
      )}
    </div>
  );
}
