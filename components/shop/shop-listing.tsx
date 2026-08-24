"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Palette,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Truck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FilterSidebar } from "@/components/category/filter-sidebar";
import { SortControl } from "@/components/category/sort-control";
import { PromoBanner } from "@/components/home/promo-banner";
import { ProductCard } from "@/components/product/product-card";
import { ProductGrid } from "@/components/product/product-grid";
import { applyFilters, getFilterFieldsForCategory, sortProducts, type FilterField, type SortOption } from "@/lib/filters";
import { t } from "@/lib/i18n";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

const PAGE_SIZE_OPTIONS = [8, 16, 24, 32];

// UI-only quick filters — not wired to real criteria yet (no ratings/color/"popularity" data
// exists in the schema). They toggle visually and show as removable chips; filtering logic
// for each will be added once that data exists.
const FAST_FILTERS = [
  { id: "featured", labelKey: "shop.fastFilter.featured", icon: Truck },
  { id: "bestSellers", labelKey: "shop.fastFilter.bestSellers", icon: Star },
  { id: "topRated", labelKey: "shop.fastFilter.topRated", icon: BadgeCheck },
  { id: "new", labelKey: "shop.fastFilter.new", icon: Sparkles },
  { id: "topItems", labelKey: "shop.fastFilter.topItems", icon: Star },
  { id: "popularItem", labelKey: "shop.fastFilter.popularItem", icon: BadgeCheck },
  { id: "bestColors", labelKey: "shop.fastFilter.bestColors", icon: Palette },
];

interface ShopListingProps {
  products: Product[];
  categories: Category[];
}

export function ShopListing({ products, categories }: ShopListingProps) {
  const [activeCategoryIds, setActiveCategoryIds] = useState<string[]>([]);
  const [activeFieldValues, setActiveFieldValues] = useState<Record<string, string[]>>({});
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
    });

    return sortProducts(result, sort);
  }, [products, activeCategoryIds, searchQuery, activeFieldValues, minPrice, maxPrice, sort]);

  // reset to page 1 whenever the result set changes shape, so we don't strand the user on an empty page
  const filterKey = JSON.stringify([activeCategoryIds, activeFieldValues, minPrice, maxPrice, searchQuery, pageSize]);
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
    <div className="container-page py-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t("shop.breadcrumbHome")}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{t("shop.breadcrumbShop")}</span>
      </nav>

      <div className="mt-4">
        <PromoBanner />
      </div>

      {/* Quick category nav — same categories as the sidebar checkboxes below */}
      <div className="mt-2 flex flex-wrap justify-center gap-6 py-6 sm:justify-start">
        {categories.map((category) => {
          const thumbnail = category.thumbnailUrl ?? products.find((product) => product.categoryId === category.id)?.images[0];
          const isActive = activeCategoryIds.includes(category.id);
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => toggleCategory(category.id)}
              className="flex flex-col items-center gap-2"
            >
              <span
                className={`relative size-24 overflow-hidden rounded-full bg-muted ring-2 ${isActive ? "ring-primary" : "ring-transparent"}`}
              >
                {thumbnail && (
                  <Image src={thumbnail} alt={category.name} fill sizes="96px" className="object-cover" />
                )}
              </span>
              <span className="text-sm font-medium text-foreground">{category.name}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 grid grid-cols-1 gap-8 border-t border-border pt-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal className="size-4" />
            <p className="text-sm font-semibold text-foreground">{t("common.filters")}</p>
          </div>

          <div className="mb-6">
            <p className="mb-2 text-sm font-medium text-foreground">{t("shop.categories")}</p>
            <div className="flex flex-col gap-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 text-sm text-foreground">
                  <Checkbox
                    checked={activeCategoryIds.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <span>{category.name}</span>
                  <span className="text-xs text-muted-foreground">({categoryCounts[category.id] ?? 0})</span>
                </label>
              ))}
            </div>
          </div>

          <FilterSidebar {...sidebarProps} />
        </aside>

        <div>
          {/* Mobile filter trigger */}
          <div className="mb-4 lg:hidden">
            <Sheet open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="size-4" />
                  {t("common.filters")}
                </Button>
              </SheetTrigger>
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
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">{t("shop.fastFilter")}</span>
            {FAST_FILTERS.map((filter) => {
              const Icon = filter.icon;
              const isActive = activeFastFilterIds.includes(filter.id);
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => toggleFastFilter(filter.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {t(filter.labelKey)}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
            <p className="text-sm text-muted-foreground">
              {total === 0
                ? t("common.noResults")
                : t("shop.showingResults")
                    .replace("{from}", String(pageStart))
                    .replace("{to}", String(pageEnd))
                    .replace("{total}", String(total))}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <SortControl value={sort} onChange={setSort} />

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span>{t("shop.show")}</span>
                <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger className="w-28" aria-label={t("shop.show")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size} {t("shop.items")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t("shop.searchPlaceholder")}
                  className="w-48 pl-9"
                />
              </div>
            </div>
          </div>

          {activeFastFilterIds.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {activeFastFilterIds.map((id) => {
                const filter = FAST_FILTERS.find((candidate) => candidate.id === id);
                if (!filter) return null;
                return (
                  <span
                    key={id}
                    className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    {t(filter.labelKey)}
                    <button type="button" onClick={() => toggleFastFilter(id)} aria-label={t("common.remove")}>
                      <X className="size-3" />
                    </button>
                  </span>
                );
              })}
              <button type="button" onClick={clearAll} className="text-xs font-medium text-primary hover:underline">
                {t("shop.clearAll")}
              </button>
            </div>
          )}

          <div className="mt-6">
            {pageItems.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
                <p className="text-sm font-medium text-foreground">{t("common.noResults")}</p>
                <p className="text-sm text-muted-foreground">{t("common.noResultsHint")}</p>
              </div>
            ) : (
              <ProductGrid>
                {pageItems.map((product) => {
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
        </div>
      </div>
    </div>
  );
}
