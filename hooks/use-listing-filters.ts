"use client";

import { useCallback, useMemo } from "react";
import { PRICE_BUCKETS } from "@/components/shop/sidebar-filter";
import {
  fieldParamKey,
  getFieldParams,
  getListParam,
  getNumberParam,
  getSortParam,
  useDebouncedParam,
  useListingSearchParams,
} from "@/hooks/use-listing-search-params";
import { matchColorSwatch, type SortOption } from "@/lib/filters";
import { getDisplayVariant } from "@/lib/product-helpers";
import type { Product } from "@/types/product";

// first of ShopToolbar's PAGE_SIZE_OPTIONS — used when the URL carries no size param
const DEFAULT_PAGE_SIZE = 16;

export interface BrandOption {
  name: string;
  count: number;
}

export interface ColorOption {
  swatch: string;
  label: string;
  count: number;
}

export interface PageSlice<T> {
  total: number;
  totalPages: number;
  currentPage: number;
  pageStart: number;
  pageEnd: number;
  pageItems: T[];
}

interface UseListingFiltersOptions {
  products: Product[];
  // /shop narrows its brand/color widgets to whichever categories are checked; /category/[slug]
  // is already one category, so it counts across everything it was handed
  scopeByCategory?: boolean;
}

// Shared filter state for the two product listings (/shop and /category/[slug]). Every value
// comes from the query string — see hooks/use-listing-search-params.ts — so filters survive a
// refresh and a filtered listing can be shared as a link. Each setter also drops the page param,
// which is the "don't strand the user on a page that no longer exists" reset the listings used
// to do with a filterKey/setPage(1) pass during render.
//
// What isn't here: each listing's own filteredProducts pipeline and its checklist widgets, which
// differ (categories checklist vs. per-spec-field widgets).
export function useListingFilters({ products, scopeByCategory = true }: UseListingFiltersOptions) {
  const { searchParams, setParams, scheduleParams, clearParams } = useListingSearchParams();

  const activeCategoryIds = useMemo(() => getListParam(searchParams, "cats"), [searchParams]);
  const activeFieldValues = useMemo(() => getFieldParams(searchParams), [searchParams]);
  const activeFastFilterIds = useMemo(() => getListParam(searchParams, "fast"), [searchParams]);
  const activeBrand = searchParams.get("brand");
  const minPrice = searchParams.get("min") ?? "";
  const maxPrice = searchParams.get("max") ?? "";
  const searchQuery = searchParams.get("q") ?? "";
  const sort = getSortParam(searchParams);
  const pageSize = getNumberParam(searchParams, "size", DEFAULT_PAGE_SIZE);
  const page = getNumberParam(searchParams, "page", 1);

  // The search box and price slider fire on every keystroke/drag — render them from a local
  // draft and write the param once the value settles, so the URL isn't rewritten per event.
  const [searchDraft, setSearchDraft] = useDebouncedParam(searchQuery, (value) =>
    scheduleParams({ q: value, page: null })
  );
  const [minPriceDraft, setMinPriceDraft] = useDebouncedParam(minPrice, (value) =>
    scheduleParams({ min: value, page: null })
  );
  const [maxPriceDraft, setMaxPriceDraft] = useDebouncedParam(maxPrice, (value) =>
    scheduleParams({ max: value, page: null })
  );

  // the toggles feed the listings' checklistWidgets memos, hence useCallback
  const toggleCategory = useCallback(
    (categoryId: string) => {
      const next = activeCategoryIds.includes(categoryId)
        ? activeCategoryIds.filter((id) => id !== categoryId)
        : [...activeCategoryIds, categoryId];
      setParams({ cats: next, page: null });
    },
    [activeCategoryIds, setParams]
  );

  const toggleFieldValue = useCallback(
    (fieldId: string, value: string) => {
      const currentValues = activeFieldValues[fieldId] ?? [];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((existing) => existing !== value)
        : [...currentValues, value];
      setParams({ [fieldParamKey(fieldId)]: nextValues, page: null });
    },
    [activeFieldValues, setParams]
  );

  const toggleFastFilter = useCallback(
    (id: string) => {
      const next = activeFastFilterIds.includes(id)
        ? activeFastFilterIds.filter((existing) => existing !== id)
        : [...activeFastFilterIds, id];
      setParams({ fast: next, page: null });
    },
    [activeFastFilterIds, setParams]
  );

  const selectBrand = useCallback((brand: string) => setParams({ brand, page: null }), [setParams]);
  const selectSort = useCallback((value: SortOption) => setParams({ sort: value, page: null }), [setParams]);
  const selectPageSize = useCallback(
    (value: number) => setParams({ size: String(value), page: null }),
    [setParams]
  );
  const goToPage = useCallback(
    (pageNumber: number) => setParams({ page: pageNumber === 1 ? null : String(pageNumber) }),
    [setParams]
  );
  const clearAll = useCallback(() => clearParams(), [clearParams]);

  const scopedProducts = useMemo(
    () =>
      !scopeByCategory || activeCategoryIds.length === 0
        ? products
        : products.filter((product) => activeCategoryIds.includes(product.categoryId)),
    [products, activeCategoryIds, scopeByCategory]
  );

  const brands: BrandOption[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of scopedProducts) {
      counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [scopedProducts]);

  // swatch colors + counts, scoped the same way as brands — matched against each product's own
  // "color"/"colour" variant axis (whichever id/labelKey names it) and reduced to the fixed set
  // of swatch classes style.min.css defines
  const colors: ColorOption[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of scopedProducts) {
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
  }, [scopedProducts]);

  // cheapest/priciest displayed-variant price, for the price slider's range — from the full list
  // handed in, not the currently filtered set, so the slider's ends don't move as you drag
  const priceBounds = useMemo(() => {
    const prices = products
      .map((product) => getDisplayVariant(product)?.price)
      .filter((price): price is number => price !== undefined);
    if (prices.length === 0) return { min: 0, max: 0 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  // product count per PRICE_BUCKETS tier, also from the full list rather than the filtered set
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

  // Slices the filtered list for the current page, clamping a page param past the end
  const paginate = useCallback(
    <T,>(items: T[]): PageSlice<T> => {
      const total = items.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const currentPage = Math.min(page, totalPages);
      return {
        total,
        totalPages,
        currentPage,
        pageStart: total === 0 ? 0 : (currentPage - 1) * pageSize + 1,
        pageEnd: Math.min(currentPage * pageSize, total),
        pageItems: items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
      };
    },
    [page, pageSize]
  );

  return {
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
    goToPage,
    clearAll,
    brands,
    colors,
    priceBounds,
    priceBucketCounts,
    paginate,
  };
}
