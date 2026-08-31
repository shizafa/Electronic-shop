"use client";

import { Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import type { Category } from "@/types/category";
import type {
  FeaturedFilter,
  StockFilter,
} from "@/components/admin/products/products-view";

interface ProductsFiltersProps {
  query: string;
  onQueryChange: (query: string) => void;
  categories: Category[];
  categoryId: string;
  onCategoryChange: (categoryId: string) => void;
  categoryCounts: Record<string, number>;
  stock: StockFilter;
  onStockChange: (value: StockFilter) => void;
  stockCounts: Record<StockFilter, number>;
  featured: FeaturedFilter;
  onFeaturedChange: (value: FeaturedFilter) => void;
  featuredCounts: Record<FeaturedFilter, number>;
  brands: string[];
  activeBrands: string[];
  onToggleBrand: (brand: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  resultCount: number;
  onClear: () => void;
}

const STOCK_OPTIONS: { value: StockFilter; labelKey: string }[] = [
  { value: "all", labelKey: "admin.products.stockStatus.all" },
  { value: "inStock", labelKey: "admin.products.stockStatus.inStock" },
  { value: "lowStock", labelKey: "admin.products.stockStatus.lowStock" },
  { value: "outOfStock", labelKey: "admin.products.stockStatus.outOfStock" },
];

const FEATURED_OPTIONS: { value: FeaturedFilter; labelKey: string }[] = [
  { value: "all", labelKey: "admin.products.featuredFilter.all" },
  { value: "featured", labelKey: "admin.products.featuredFilter.featured" },
  { value: "notFeatured", labelKey: "admin.products.featuredFilter.notFeatured" },
];

export function ProductsFilters({
  query,
  onQueryChange,
  categories,
  categoryId,
  onCategoryChange,
  categoryCounts,
  stock,
  onStockChange,
  stockCounts,
  featured,
  onFeaturedChange,
  featuredCounts,
  brands,
  activeBrands,
  onToggleBrand,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  resultCount,
  onClear,
}: ProductsFiltersProps) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{t("admin.products.filters")}</p>
        <button type="button" onClick={onClear} className="text-xs font-medium text-primary hover:underline">
          {t("admin.products.clearFilters")}
        </button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t("admin.products.searchPlaceholder")}
          className="pl-8"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t("admin.products.category")}
        </p>
        <label className="flex items-center justify-between gap-2 text-sm">
          <span className="flex items-center gap-2">
            <input
              type="radio"
              name="product-category"
              checked={categoryId === "all"}
              onChange={() => onCategoryChange("all")}
              className="size-3.5 accent-primary"
            />
            {t("admin.products.allCategories")}
          </span>
          <span className="text-xs text-muted-foreground">{categoryCounts.all ?? 0}</span>
        </label>
        {categories.map((category) => (
          <label key={category.id} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="product-category"
                checked={categoryId === category.id}
                onChange={() => onCategoryChange(category.id)}
                className="size-3.5 accent-primary"
              />
              {category.name}
            </span>
            <span className="text-xs text-muted-foreground">{categoryCounts[category.id] ?? 0}</span>
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t("admin.products.stockStatus")}
        </p>
        {STOCK_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="product-stock"
                checked={stock === option.value}
                onChange={() => onStockChange(option.value)}
                className="size-3.5 accent-primary"
              />
              {t(option.labelKey)}
            </span>
            <span className="text-xs text-muted-foreground">{stockCounts[option.value]}</span>
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t("admin.products.featuredFilter")}
        </p>
        {FEATURED_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="product-featured"
                checked={featured === option.value}
                onChange={() => onFeaturedChange(option.value)}
                className="size-3.5 accent-primary"
              />
              {t(option.labelKey)}
            </span>
            <span className="text-xs text-muted-foreground">{featuredCounts[option.value]}</span>
          </label>
        ))}
      </div>

      {brands.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {t("admin.products.brands")}
          </p>
          <div className="flex max-h-40 flex-col gap-2 overflow-y-auto">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 text-sm">
                <Checkbox checked={activeBrands.includes(brand)} onCheckedChange={() => onToggleBrand(brand)} />
                {brand}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t("admin.products.priceRange")}
        </p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            value={minPrice}
            onChange={(event) => onMinPriceChange(event.target.value)}
            placeholder={t("admin.products.minPrice")}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(event) => onMaxPriceChange(event.target.value)}
            placeholder={t("admin.products.maxPrice")}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {resultCount.toLocaleString()} {t("admin.products.results")}
      </p>
    </div>
  );
}
