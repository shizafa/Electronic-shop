"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, SlidersHorizontal } from "lucide-react";
import { ProductsFilters } from "@/components/admin/products/products-filters";
import { ProductsTable, totalStock } from "@/components/admin/products/products-table";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
}

export type StockFilter = "all" | "inStock" | "outOfStock";
export type FeaturedFilter = "all" | "featured" | "notFeatured";

function minPriceOf(product: Product): number | undefined {
  if (product.variants.length === 0) return undefined;
  return Math.min(...product.variants.map((variant) => variant.price));
}

function matchesStock(product: Product, stock: StockFilter): boolean {
  if (stock === "inStock") return totalStock(product) > 0;
  if (stock === "outOfStock") return totalStock(product) === 0;
  return true;
}

function matchesFeatured(product: Product, featured: FeaturedFilter): boolean {
  if (featured === "featured") return Boolean(product.featured);
  if (featured === "notFeatured") return !product.featured;
  return true;
}

function matchesBrands(product: Product, activeBrands: string[]): boolean {
  return activeBrands.length === 0 || activeBrands.includes(product.brand);
}

function matchesPrice(product: Product, min: string, max: string): boolean {
  const price = minPriceOf(product);
  if (price === undefined) return true;
  if (min && price < Number(min)) return false;
  if (max && price > Number(max)) return false;
  return true;
}

export function ProductsView({ products, categories }: ProductsViewProps) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [stock, setStock] = useState<StockFilter>("all");
  const [featured, setFeatured] = useState<FeaturedFilter>("all");
  const [activeBrands, setActiveBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);

  const categoryNameById = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, category.name])),
    [categories]
  );

  const allBrands = useMemo(
    () => Array.from(new Set(products.map((product) => product.brand))).sort((a, b) => a.localeCompare(b)),
    [products]
  );

  const searched = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(normalizedQuery) || product.brand.toLowerCase().includes(normalizedQuery)
    );
  }, [products, query]);

  function toggleBrand(brand: string) {
    setActiveBrands((current) => (current.includes(brand) ? current.filter((b) => b !== brand) : [...current, brand]));
  }

  // Each filter group's counts reflect every OTHER active filter (search + sibling groups),
  // but not the group's own current selection — same cascading pattern as the Customers filters.
  const categoryCounts = useMemo(() => {
    const base = searched
      .filter((p) => matchesStock(p, stock))
      .filter((p) => matchesFeatured(p, featured))
      .filter((p) => matchesBrands(p, activeBrands))
      .filter((p) => matchesPrice(p, minPrice, maxPrice));
    const counts: Record<string, number> = { all: base.length };
    for (const category of categories) counts[category.id] = base.filter((p) => p.categoryId === category.id).length;
    return counts;
  }, [searched, stock, featured, activeBrands, minPrice, maxPrice, categories]);

  const stockCounts = useMemo(() => {
    const base = searched
      .filter((p) => categoryId === "all" || p.categoryId === categoryId)
      .filter((p) => matchesFeatured(p, featured))
      .filter((p) => matchesBrands(p, activeBrands))
      .filter((p) => matchesPrice(p, minPrice, maxPrice));
    return {
      all: base.length,
      inStock: base.filter((p) => totalStock(p) > 0).length,
      outOfStock: base.filter((p) => totalStock(p) === 0).length,
    };
  }, [searched, categoryId, featured, activeBrands, minPrice, maxPrice]);

  const featuredCounts = useMemo(() => {
    const base = searched
      .filter((p) => categoryId === "all" || p.categoryId === categoryId)
      .filter((p) => matchesStock(p, stock))
      .filter((p) => matchesBrands(p, activeBrands))
      .filter((p) => matchesPrice(p, minPrice, maxPrice));
    return {
      all: base.length,
      featured: base.filter((p) => p.featured).length,
      notFeatured: base.filter((p) => !p.featured).length,
    };
  }, [searched, categoryId, stock, activeBrands, minPrice, maxPrice]);

  const filteredProducts = useMemo(() => {
    return searched
      .filter((p) => categoryId === "all" || p.categoryId === categoryId)
      .filter((p) => matchesStock(p, stock))
      .filter((p) => matchesFeatured(p, featured))
      .filter((p) => matchesBrands(p, activeBrands))
      .filter((p) => matchesPrice(p, minPrice, maxPrice));
  }, [searched, categoryId, stock, featured, activeBrands, minPrice, maxPrice]);

  function clearFilters() {
    setQuery("");
    setCategoryId("all");
    setStock("all");
    setFeatured("all");
    setActiveBrands([]);
    setMinPrice("");
    setMaxPrice("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" size="sm" onClick={() => setFiltersOpen((current) => !current)}>
          <SlidersHorizontal className="size-4" />
          {t(filtersOpen ? "admin.products.hideFilters" : "admin.products.showFilters")}
        </Button>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="size-4" />
            {t("admin.products.newProduct")}
          </Link>
        </Button>
      </div>

      <div className={`grid grid-cols-1 gap-4 ${filtersOpen ? "lg:grid-cols-[260px_1fr]" : ""}`}>
        {filtersOpen && (
          <ProductsFilters
            query={query}
            onQueryChange={setQuery}
            categories={categories}
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
            categoryCounts={categoryCounts}
            stock={stock}
            onStockChange={setStock}
            stockCounts={stockCounts}
            featured={featured}
            onFeaturedChange={setFeatured}
            featuredCounts={featuredCounts}
            brands={allBrands}
            activeBrands={activeBrands}
            onToggleBrand={toggleBrand}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            resultCount={filteredProducts.length}
            onClear={clearFilters}
          />
        )}

        <div className="min-w-0">
          <ProductsTable products={filteredProducts} categoryNameById={categoryNameById} />
        </div>
      </div>
    </div>
  );
}
