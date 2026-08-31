"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FilterSidebar } from "@/components/category/filter-sidebar";
import { PromoBanner } from "@/components/shop/promo-banner";
import { QuickLink } from "@/components/shop/quick-link";
import { PRICE_BUCKETS, SidebarFilter, type ChecklistWidgetData } from "@/components/shop/sidebar-filter";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { ProductCard } from "@/components/product/product-card";
import { ProductGrid } from "@/components/product/product-grid";
import { applyFilters, getFilterFieldsForCategory, sortProducts, type FilterField, type SortOption } from "@/lib/filters";
import { t } from "@/lib/i18n";
import { getDisplayVariant } from "@/lib/product-helpers";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

interface ShopListingProps {
  products: Product[];
  categories: Category[];
}

export function ShopListing({ products, categories }: ShopListingProps) {
  const [activeCategoryIds, setActiveCategoryIds] = useState<string[]>([]);
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

  function toggleCategory(categoryId: string) {
    setActiveCategoryIds((current) =>
      current.includes(categoryId) ? current.filter((id) => id !== categoryId) : [...current, categoryId]
    );
  }

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
    setActiveCategoryIds([]);
    setActiveFieldValues({});
    setActiveBrand(null);
    setMinPrice("");
    setMaxPrice("");
    setActiveFastFilterIds([]);
    setSearchQuery("");
  }

  // category product counts, computed from the full catalog (not the currently filtered set)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const product of products) {
      counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1;
    }
    return counts;
  }, [products]);

  // sidebar's checklist widgets — /shop only has one: the Categories checklist
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
    ],
    [categories, categoryCounts, activeCategoryIds]
  );

  // brand options + product counts, computed from the full catalog (not the currently filtered set)
  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  // cheapest/priciest displayed-variant price across the full catalog, for the price slider's range
  const priceBounds = useMemo(() => {
    const prices = products
      .map((product) => getDisplayVariant(product)?.price)
      .filter((price): price is number => price !== undefined);
    if (prices.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  // product count per PRICE_BUCKETS tier, computed from the full catalog (not the currently filtered set)
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

  // spec filter fields, drawn from whichever categories are currently checked; when more than
  // one is checked, each field is labeled with its category so they don't blur together
  const filterFields: FilterField[] = useMemo(() => {
    if (activeCategoryIds.length === 0) return [];

    const selected = categories.filter((category) => activeCategoryIds.includes(category.id));
    if (selected.length === 1) {
      const category = selected[0];
      return getFilterFieldsForCategory(
        category,
        products.filter((product) => product.categoryId === category.id)
      );
    }

    return selected.flatMap((category) => {
      const categoryProducts = products.filter((product) => product.categoryId === category.id);
      return getFilterFieldsForCategory(category, categoryProducts).map((field) => ({
        ...field,
        id: field.id,
        label: `${category.name}: ${field.label}`,
      }));
    });
  }, [activeCategoryIds, categories, products]);

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

    return sortProducts(result, sort);
  }, [products, activeCategoryIds, searchQuery, activeFieldValues, activeBrand, minPrice, maxPrice, sort]);

  // reset to page 1 whenever the result set changes shape, so we don't strand the user on an empty page
  const filterKey = JSON.stringify([
    activeCategoryIds,
    activeFieldValues,
    activeBrand,
    minPrice,
    maxPrice,
    searchQuery,
    pageSize,
  ]);
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

  const sidebarProps = {
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
      <PromoBanner />

      <QuickLink categories={categories} products={products} />

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
