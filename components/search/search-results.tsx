"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import { ProductGrid } from "@/components/product/product-grid";
import { sortProducts, type SortOption } from "@/lib/filters";
import { t } from "@/lib/i18n";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

const SORT_OPTIONS: { value: SortOption; labelKey: string }[] = [
  { value: "price_asc", labelKey: "sort.priceAsc" },
  { value: "price_desc", labelKey: "sort.priceDesc" },
  { value: "name_asc", labelKey: "sort.nameAsc" },
];

interface SearchResultsProps {
  query: string;
  products: Product[];
  categories: Category[];
}

// SearchResults — displays products matching a search query, with sorting. Same
// container/row/ProductGrid structure as /deals (app/(site)/deals/page.tsx) so results sit at
// the same alignment and gutter width as the homepage's product grids.
export function SearchResults({ query, products, categories }: SearchResultsProps) {
  const [sort, setSort] = useState<SortOption>("price_asc");
  const sortedProducts = useMemo(() => sortProducts(products, sort), [products, sort]);

  return (
    <div className="rbt-component-area rbt-catagories-area rbt-section-gap2">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="rbt-component-section-title d-flex flex-row justify-content-between align-items-center p-0 mb--32 mb_sm--16 border-0">
              <div>
                <h2 className="rbt-title h4">
                  <span className="rbt-bold--text">
                    {query ? `${t("search.resultsFor")} "${query}"` : t("nav.search")}
                  </span>
                </h2>
                <p className="desc mb--0">
                  {sortedProducts.length} {sortedProducts.length === 1 ? t("search.productFound") : t("search.productsFound")}
                </p>
              </div>

              {sortedProducts.length > 0 && (
                <div className="rbt-modern-select rbt-shop-view-sort-select-one">
                  <select
                    className="rbt-select-activation"
                    aria-label={t("common.sortBy")}
                    value={sort}
                    onChange={(event) => setSort(event.target.value as SortOption)}
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {sortedProducts.length > 0 ? (
          <div className="row row--12 mt_dec--24">
            <ProductGrid>
              {sortedProducts.map((product) => {
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
              <p>{t("common.noResults")}</p>
              <p>{t("search.noResultsHint")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}