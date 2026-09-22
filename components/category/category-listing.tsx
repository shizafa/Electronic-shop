"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useListingFilters } from "@/hooks/use-listing-filters";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CategoryBanner } from "@/components/category/category-banner";
import { CategoryBreadcrumb } from "@/components/category/category-breadcrumb";
import { FilterSidebar } from "@/components/category/filter-sidebar";
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
} from "@/lib/filters";
import { t } from "@/lib/i18n";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

interface CategoryListingProps {
  category: Category;
  products: Product[];
  allCategories: Category[];
  allProducts: Product[];
}

// CategoryListing — same sidebar/toolbar/grid UI as ShopListing (components/shop/shop-listing.tsx),
// scoped to one category: the sidebar's checklist widgets are this category's real spec fields
// (Tonnage, Energy Rating, ...) instead of a Categories list, and the banner is the category's
// own real bannerUrl instead of the generic shop promo banner.
export function CategoryListing({ category, products, allCategories, allProducts }: CategoryListingProps) {
  // Filter state (and the widget data derived from it) is shared with /shop — see
  // hooks/use-listing-filters.ts. Everything lives in the query string. scopeByCategory is off:
  // this page is already one category, so the brand/color widgets count across all of it.
  const {
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
    toggleFieldValue,
    toggleFastFilter,
    selectBrand,
    selectSort,
    selectPageSize,
    goToPage,
    clearAll,
    brands,
    colors,
    priceBounds,
    priceBucketCounts,
    paginate,
  } = useListingFilters({ products, scopeByCategory: false });
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // this category's real spec/variant fields (e.g. Tonnage, Energy Rating for Air Conditioners)
  const filterFields = useMemo(() => getFilterFieldsForCategory(category, products), [category, products]);

  // sidebar's checklist widgets — one per real spec field, in place of /shop's Categories widget
  const checklistWidgets: ChecklistWidgetData[] = useMemo(
    () =>
      filterFields.map((field) => ({
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
    [filterFields, activeFieldValues, toggleFieldValue]
  );

  const filteredProducts = useMemo(() => {
    let result = products;

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
  }, [products, searchQuery, activeFieldValues, activeBrand, minPrice, maxPrice, activeFastFilterIds, sort]);

  const { total, totalPages, currentPage, pageStart, pageEnd, pageItems } = paginate(filteredProducts);

  const mobileSidebarProps = {
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
      <CategoryBreadcrumb category={category} />

      <CategoryBanner category={category} />

      <QuickLink categories={allCategories} products={allProducts} activeCategoryIds={[category.id]} />

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
                {pageItems.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categoryName={category.name}
                    categorySlug={category.slug}
                  />
                ))}
              </ProductGrid>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                aria-label={t("shop.previous")}
              >
                <ChevronLeft className="size-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  size="icon"
                  onClick={() => goToPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                aria-label={t("shop.next")}
              >
                <ChevronRight className="size-4" />
              </Button>
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
            <FilterSidebar {...mobileSidebarProps} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
