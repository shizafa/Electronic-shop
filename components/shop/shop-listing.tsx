"use client";

import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FilterSidebar } from "@/components/category/filter-sidebar";
import { PromoBanner } from "@/components/shop/promo-banner";
import { QuickLink } from "@/components/shop/quick-link";
import { PRICE_BUCKETS, SidebarFilter, type ChecklistWidgetData } from "@/components/shop/sidebar-filter";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { ProductCard } from "@/components/product/product-card";
import { ProductGrid } from "@/components/product/product-grid";
import {
  applyFastFilters,
  applyFilters,
  getFilterFieldsForCategory,
  sortProducts,
  type FilterField,
  type SortOption,
} from "@/lib/filters";
import { t } from "@/lib/i18n";
import { getDisplayVariant } from "@/lib/product-helpers";
import type { Category, SpecFieldType } from "@/types/category";
import type { Product } from "@/types/product";

// Same conversion category-listing.tsx uses for its per-spec-field checklist widgets.
function formatOptionLabel(value: string, type: SpecFieldType): string {
  if (type === "boolean") return value === "true" ? "Yes" : "No";
  return value;
}

// style.min.css only defines these 8 swatch backgrounds (rbt-swatch-bg-black, ...) — a real
// axis value like "Onyx Black" or "Ice Blue" is matched against this set by substring rather
// than rendered as its own swatch, since there's no class (or hex-color data) for anything
// outside it.
const KNOWN_COLOR_SWATCHES = ["black", "blue", "brown", "gray", "green", "orange", "red", "yellow"] as const;

function matchColorSwatch(value: string): string | undefined {
  const normalized = value.toLowerCase();
  if (normalized.includes("grey")) return "gray";
  return KNOWN_COLOR_SWATCHES.find((swatch) => normalized.includes(swatch));
}

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
    [categories, categoryCounts, activeCategoryIds, filterFields, activeFieldValues]
  );

  // brand options + product counts, scoped to whichever categories are currently checked (the
  // full catalog when none are) — same scoping filterFields already applies to spec widgets
  // products within whichever categories are currently checked (the full catalog when none
  // are) — shared scope for the brand and color widgets below
  const categoryScopedProducts = useMemo(
    () =>
      activeCategoryIds.length === 0
        ? products
        : products.filter((product) => activeCategoryIds.includes(product.categoryId)),
    [products, activeCategoryIds]
  );

  const brands = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of categoryScopedProducts) {
      counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categoryScopedProducts]);

  // swatch colors + counts, scoped the same way as brands — matched against each product's own
  // "color"/"colour" variant axis (whichever id/labelKey names it) and reduced to the fixed set
  // of swatch classes style.min.css defines
  const colors = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of categoryScopedProducts) {
      const colorAxis = product.variantAxes.find(
        (axis) => /colou?r/i.test(axis.id) || /colou?r/i.test(axis.labelKey)
      );
      if (!colorAxis) continue;
      for (const variant of product.variants) {
        const rawValue = variant.axisValues[colorAxis.id];
        const swatch = rawValue ? matchColorSwatch(rawValue) : undefined;
        if (!swatch) continue;
        counts.set(swatch, (counts.get(swatch) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([swatch, count]) => ({ swatch, label: swatch[0].toUpperCase() + swatch.slice(1), count }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [categoryScopedProducts]);

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

  // reset to page 1 whenever the result set changes shape, so we don't strand the user on an empty page
  const filterKey = JSON.stringify([
    activeCategoryIds,
    activeFieldValues,
    activeBrand,
    minPrice,
    maxPrice,
    searchQuery,
    activeFastFilterIds,
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

  function goToPage(pageNumber: number) {
    setPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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

      <QuickLink categories={categories} products={products} activeCategoryIds={activeCategoryIds} />

      <div className="container">
      <div className="row mt-2 border-t border-border pt-6">
        <div className="col-xl-3 col-lg-4 col-md-12 col-sm-12 col-12 d-none d-lg-block">
          <SidebarFilter
            checklistWidgets={checklistWidgets}
            colors={colors}
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
