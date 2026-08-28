"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CategoryBanner } from "@/components/category/category-banner";
import { CategoryBreadcrumb } from "@/components/category/category-breadcrumb";
import { FilterSidebar } from "@/components/category/filter-sidebar";
import { QuickLink } from "@/components/shop/quick-link";
import { PRICE_BUCKETS, SidebarFilter, type ChecklistWidgetData } from "@/components/shop/sidebar-filter";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { ProductCard } from "@/components/product/product-card";
import { ProductGrid } from "@/components/product/product-grid";
import { applyFilters, getFilterFieldsForCategory, sortProducts, type SortOption } from "@/lib/filters";
import { t } from "@/lib/i18n";
import { getDisplayVariant } from "@/lib/product-helpers";
import type { Category, SpecFieldType } from "@/types/category";
import type { Product } from "@/types/product";

function formatOptionLabel(value: string, type: SpecFieldType): string {
  if (type === "boolean") return value === "true" ? "Yes" : "No";
  return value;
}

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
  const [activeFieldValues, setActiveFieldValues] = useState<Record<string, string[]>>({});
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortOption>("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFastFilterIds, setActiveFastFilterIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(16);
  const [page, setPage] = useState(1);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  function toggleFieldValue(fieldId: string, value: string) {
    setActiveFieldValues((current) => {
      const currentValues = current[fieldId] ?? [];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((existing) => existing !== value)
        : [...currentValues, value];
      return { ...current, [fieldId]: nextValues };
    });
  }

  function toggleFastFilter(id: string) {
    setActiveFastFilterIds((current) =>
      current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id]
    );
  }

  function clearAll() {
    setActiveFieldValues({});
    setActiveBrand(null);
    setMinPrice("");
    setMaxPrice("");
    setActiveFastFilterIds([]);
    setSearchQuery("");
  }

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
    [filterFields, activeFieldValues]
  );

  // brand options + product counts, computed from this category's full product list
  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  // cheapest/priciest displayed-variant price within this category, for the price slider's range
  const priceBounds = useMemo(() => {
    const prices = products
      .map((product) => getDisplayVariant(product)?.price)
      .filter((price): price is number => price !== undefined);
    if (prices.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  // product count per PRICE_BUCKETS tier, computed from this category's full product list
  const priceBucketCounts = useMemo(
    () =>
      PRICE_BUCKETS.map((bucket) => {
        return products.filter((product) => {
          const price = getDisplayVariant(product)?.price;
          if (price === undefined) return false;
          if (bucket.min !== undefined && price < bucket.min) return false;
          if (bucket.max !== undefined && price >= bucket.max) return false;
          return true;
        }).length;
      }),
    [products]
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

    return sortProducts(result, sort);
  }, [products, searchQuery, activeFieldValues, activeBrand, minPrice, maxPrice, sort]);

  // reset to page 1 whenever the result set changes shape, so we don't strand the user on an empty page
  const filterKey = JSON.stringify([activeFieldValues, activeBrand, minPrice, maxPrice, searchQuery, pageSize]);
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const total = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, total);
  const pageItems = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const mobileSidebarProps = {
    fields: filterFields,
    activeFieldValues,
    onToggleFieldValue: toggleFieldValue,
    minPrice,
    maxPrice,
    onMinPriceChange: setMinPrice,
    onMaxPriceChange: setMaxPrice,
    onClearAll: clearAll,
  };

  return (
    <>
      <CategoryBreadcrumb category={category} />

      <CategoryBanner category={category} />

      <QuickLink categories={allCategories} products={allProducts} />

      <div className="container">
      <div className="row mt-2 border-t border-border pt-6">
        <div className="col-xl-3 col-lg-4 col-md-12 col-sm-12 col-12 d-none d-lg-block">
          <SidebarFilter
            checklistWidgets={checklistWidgets}
            brands={brands}
            activeBrand={activeBrand}
            onSelectBrand={setActiveBrand}
            priceBounds={priceBounds}
            priceBucketCounts={priceBucketCounts}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
          />
        </div>

        <ShopToolbar
          total={total}
          pageStart={pageStart}
          pageEnd={pageEnd}
          sort={sort}
          onSortChange={setSort}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          activeFastFilterIds={activeFastFilterIds}
          onToggleFastFilter={toggleFastFilter}
          onClearAll={clearAll}
          onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
        >
          <div className="mt-6">
            {pageItems.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
                <p className="text-sm font-medium text-foreground">{t("common.noResults")}</p>
                <p className="text-sm text-muted-foreground">{t("common.noResultsHint")}</p>
              </div>
            ) : (
              <ProductGrid>
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
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                aria-label={t("shop.previous")}
              >
                <ChevronLeft className="size-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  size="icon"
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
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
