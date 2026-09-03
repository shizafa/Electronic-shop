import type { Metadata } from "next";
import { ProductCard } from "@/components/product/product-card";
import { ProductGrid } from "@/components/product/product-grid";
import { getAllCategories } from "@/lib/categories";
import { t } from "@/lib/i18n";
import { getAllProducts } from "@/lib/products";
import { getDiscountPercent, getDisplayVariant } from "@/lib/product-helpers";

export const metadata: Metadata = {
  title: t("deals.title"),
};

// /deals route: only products with a live discount (variant.compareAtPrice > price). Being
// featured is not enough on its own — a featured product with no discount isn't a "deal".
export default async function DealsPage() {
  const [allProducts, categories] = await Promise.all([getAllProducts(), getAllCategories()]);
  const deals = allProducts.filter((product) => {
    const displayVariant = getDisplayVariant(product);
    return displayVariant !== undefined && getDiscountPercent(displayVariant) !== undefined;
  });

  return (
    <div className="rbt-component-area rbt-catagories-area rbt-section-gap2">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="rbt-component-section-title rbt-gap--4 mb--32 mb_sm--16 p-0 border-0 text-left">
              <h2 className="rbt-title h4">
                <span className="rbt-bold--text">{t("deals.title")}</span>
              </h2>
              <p className="desc mb--0">{t("deals.subtitle")}</p>
            </div>
          </div>
        </div>

        {deals.length > 0 ? (
          <div className="row row--12 mt_dec--24">
            <ProductGrid>
              {deals.map((product) => {
                const category = categories.find((candidate) => candidate.id === product.categoryId);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categoryName={category?.name}
                    categorySlug={category?.slug}
                  />
                );
              })}
            </ProductGrid>
          </div>
        ) : (
          <div className="row">
            <div className="col-12 text-center">
              <p>{t("deals.empty")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
