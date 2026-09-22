"use client";

import { useMemo, useState } from "react";
import { useListingFilters } from "@/hooks/use-listing-filters";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FilterSidebar } from "@/components/category/filter-sidebar";
import { PromoBanner } from "@/components/shop/promo-banner";
import { QuickLink } from "@/components/shop/quick-link";
import { SidebarFilter, type ChecklistWidgetData } from "@/components/shop/sidebar-filter";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { ProductCard } from "@/components/product/product-card";
import { ProductGrid } from "@/components/product/product-grid";
import {
  applyFastFilters,
  applyFilters,
  formatOptionLabel,
  getFilterFieldsForCategory,
  sortProducts,
  type FilterField,
} from "@/lib/filters";
import { t } from "@/lib/i18n";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

interface ShopListingProps {
  products: Product[];
  categories: Category[];
}

export function ShopListing({ products, categories }: ShopListingProps) {
  // Filter state (and the widget data derived from it) is shared with /category/[slug] — see
  // hooks/use-listing-filters.ts. Everything lives in the query string.
  const {
    activeCategoryIds,
    activeFieldValues,
    activeFastFilterIds,
    activeBrand,
    minPrice,
    maxPrice,
    searchQuery,
    sort,
    pageSize,
    searchDraft,
    setSearchDraft,
    minPriceDraft,
    setMinPriceDraft,
    maxPriceDraft,
    setMaxPriceDraft,
    toggleCategory,
    toggleFieldValue,
    toggleFastFilter,
    selectBrand,
    selectSort,
    selectPageSize,
    goToPage: goToPageParam,
    clearAll,
    brands,
    colors,
    priceBounds,
    priceBucketCounts,
    paginate,
  } = useListingFilters({ products });
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // category product counts, computed from the full catalog (not the currently filtered set)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const product of products) {
      counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1;
    }
    return counts;
  }, [products]);

  // spec filter fields, drawn from whichever categories are currently checked; when more than
  // one is checked, only fields shared by every selected category survive (matched by id — e.g.
  // "warrantyYears" on both air-conditioners and televisions), with their per-category option
  // counts merged, rather than stacking every category's fields labeled by category
  const filterFields: FilterField[] = useMemo(() => {
    if (activeCategoryIds.length === 0) return [];

    const selected = categories.filter((category) => activeCategoryIds.includes(category.id));
    const perCategoryFields = selected.map((category) =>
      getFilterFieldsForCategory(
        category,
        products.filter((product) => product.categoryId === category.id)
      )
    );

    const [first, ...rest] = perCategoryFields;
    if (rest.length === 0) return first ?? [];

    return first
      .filter((field) => rest.every((fields) => fields.some((candidate) => candidate.id === field.id)))
      .map((field) => {
        const optionCounts = new Map<string, number>();
        for (const fields of perCategoryFields) {
          const match = fields.find((candidate) => candidate.id === field.id);
          for (const option of match?.options ?? []) {
            optionCounts.set(option.value, (optionCounts.get(option.value) ?? 0) + option.count);
          }
        }
        return { ...field, options: Array.from(optionCounts.entries()).map(([value, count]) => ({ value, count })) };
      });
  }, [activeCategoryIds, categories, products]);

  // sidebar's checklist widgets — the Categories checklist, plus one widget per real spec field
  // (Tonnage, Energy Rating, ...) shared by every currently-checked category, same
  // ChecklistWidgetSection pattern /category/[slug] uses for its own per-spec-field widgets
  const checklistWidgets: ChecklistWidgetData[] = useMemo(
    () => [
      {
        id: "categories",
        title: "Categories",
        options: categories.map((category) => ({
          id: category.id,
          label: category.name,
          count: categoryCounts[category.id] ?? 0,
        })),
        activeIds: activeCategoryIds,
        onToggle: toggleCategory,
      },
      ...filterFields.map((field) => ({
        id: field.id,
        title: field.label,
        options: field.options.map((option) => ({
          id: option.value,
          label: formatOptionLabel(option.value, field.type),
          count: option.count,
        })),
        activeIds: activeFieldValues[field.id] ?? [],
        onToggle: (value: string) => toggleFieldValue(field.id, value),
      })),
    ],
    [categories, categoryCounts, activeCategoryIds, filterFields, activeFieldValues, toggleCategory, toggleFieldValue]
  );

  const filteredProducts = useMemo(() => {
    let result =
      activeCategoryIds.length === 0
        ? products
        : products.filter((product) => activeCategoryIds.includes(product.categoryId));

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((product) => product.name.toLowerCase().includes(query));
    }

    result = applyFilters(result, {
      fields: activeFieldValues,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      brand: activeBrand ?? undefined,
    });

    result = applyFastFilters(result, activeFastFilterIds);

    return sortProducts(result, sort);
  }, [
    products,
    activeCategoryIds,
    searchQuery,
    activeFieldValues,
    activeBrand,
    minPrice,
    maxPrice,
    activeFastFilterIds,
    sort,
  ]);

  const { total, totalPages, currentPage, pageStart, pageEnd, pageItems } = paginate(filteredProducts);

  function goToPage(pageNumber: number) {
    goToPageParam(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const sidebarProps = {
    fields: filterFields,
    activeFieldValues,
    onToggleFieldValue: toggleFieldValue,
    minPrice: minPriceDraft,
    maxPrice: maxPriceDraft,
    onMinPriceChange: setMinPriceDraft,
    onMaxPriceChange: setMaxPriceDraft,
    onClearAll: clearAll,
  };

  return (
    <>
      <PromoBanner />

      <QuickLink categories={categories} products={products} activeCategoryIds={activeCategoryIds} />

      <div className="container">
      <div className="row mt-2 border-t border-border pt-6">
        <div className="col-xl-3 col-lg-4 col-md-12 col-sm-12 col-12 d-none d-lg-block">
          <SidebarFilter
            checklistWidgets={checklistWidgets}
            colors={colors}
            brands={brands}
            activeBrand={activeBrand}
            onSelectBrand={selectBrand}
            priceBounds={priceBounds}
            priceBucketCounts={priceBucketCounts}
            minPrice={minPriceDraft}
            maxPrice={maxPriceDraft}
            onMinPriceChange={setMinPriceDraft}
            onMaxPriceChange={setMaxPriceDraft}
          />
        </div>

        <ShopToolbar
          total={total}
          pageStart={pageStart}
          pageEnd={pageEnd}
          sort={sort}
          onSortChange={selectSort}
          pageSize={pageSize}
          onPageSizeChange={selectPageSize}
          searchQuery={searchDraft}
          onSearchQueryChange={setSearchDraft}
          activeFastFilterIds={activeFastFilterIds}
          onToggleFastFilter={toggleFastFilter}
          onClearAll={clearAll}
          onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
        >
          <div className="mt-6 shop-product-grid">
            {pageItems.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
                <p className="text-sm font-medium text-foreground">{t("common.noResults")}</p>
                <p className="text-sm text-muted-foreground">{t("common.noResultsHint")}</p>
              </div>
            ) : (
              <ProductGrid priorityCount={3}>
                {pageItems.map((product) => {
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
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt--40 d-flex justify-content-center">
              <ul className="rbt-pagination">
                {currentPage > 1 && (
                  <li>
                    <a
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        goToPage(Math.max(1, currentPage - 1));
                      }}
                      aria-label={t("shop.previous")}
                    >
                      <i className="fa-regular fa-chevron-left" />
                    </a>
                  </li>
                )}
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <li key={pageNumber}>
                    <a
                      href="#"
                      className={pageNumber === currentPage ? "active" : undefined}
                      onClick={(event) => {
                        event.preventDefault();
                        goToPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </a>
                  </li>
                ))}
                {currentPage < totalPages && (
                  <li>
                    <a
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        goToPage(Math.min(totalPages, currentPage + 1));
                      }}
                      aria-label={t("shop.next")}
                    >
                      <i className="fa-regular fa-chevron-right" />
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </ShopToolbar>
      </div>
      </div>

      {/* Mobile filter drawer — bridge until a template off-canvas filter piece is pasted;
          ShopToolbar's "Show Filter" button (mobile only) opens this. */}
      <Sheet open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
        <SheetContent side="left" className="w-3/4 overflow-y-auto sm:max-w-xs">
          <SheetHeader>
            <SheetTitle>{t("common.filters")}</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-4">
            <p className="mb-2 text-sm font-medium text-foreground">{t("shop.categories")}</p>
            <div className="mb-6 flex flex-col gap-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 text-sm text-foreground">
                  <Checkbox
                    checked={activeCategoryIds.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <span>{category.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({categoryCounts[category.id] ?? 0})
                  </span>
                </label>
              ))}
            </div>
            <FilterSidebar {...sidebarProps} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
