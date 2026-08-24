"use client";

import { useMemo, useState } from "react";
import { SortControl } from "@/components/category/sort-control";
import { ProductCard } from "@/components/product/product-card";
import { ProductGrid } from "@/components/product/product-grid";
import { sortProducts, type SortOption } from "@/lib/filters";
import { t } from "@/lib/i18n";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

interface SearchResultsProps {
  query: string;
  products: Product[];
  categories: Category[];
}

// SearchResults — displays products matching a search query, with sorting
export function SearchResults({ query, products, categories }: SearchResultsProps) {
  const [sort, setSort] = useState<SortOption>("featured");
  const sortedProducts = useMemo(() => sortProducts(products, sort), [products, sort]);

  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            {query ? `${t("search.resultsFor")} "${query}"` : t("nav.search")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {sortedProducts.length} {t("common.products")}
          </p>
        </div>

        {sortedProducts.length > 0 && <SortControl value={sort} onChange={setSort} />}
      </div>

      <div className="mt-6">
        {sortedProducts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
            <p className="text-sm font-medium text-foreground">{t("common.noResults")}</p>
            <p className="text-sm text-muted-foreground">{t("search.noResultsHint")}</p>
          </div>
        ) : (
          <ProductGrid>
            {sortedProducts.map((product) => {
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
        )}
      </div>
    </div>
  );
}