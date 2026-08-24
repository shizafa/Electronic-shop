"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FilterSidebar } from "@/components/category/filter-sidebar";
import { SortControl } from "@/components/category/sort-control";
import { ProductCard } from "@/components/product/product-card";
import { ProductGrid } from "@/components/product/product-grid";
import { applyFilters, getFilterFieldsForCategory, sortProducts, type SortOption } from "@/lib/filters";
import { t } from "@/lib/i18n";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

interface CategoryListingProps {
  category: Category;
  products: Product[];
}

// CategoryListing — shows a category's products with filtering, sorting, and a mobile filter drawer
export function CategoryListing({ category, products }: CategoryListingProps) {
  // build the available filter options (e.g. brand, spec values) from this category's products
  const filterFields = useMemo(
    () => getFilterFieldsForCategory(category, products),
    [category, products]
  );

  const [activeFieldValues, setActiveFieldValues] = useState<Record<string, string[]>>({});
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortOption>("featured");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // toggle a single checkbox value on/off within its filter field's selected list
  function toggleFieldValue(fieldId: string, value: string) {
    setActiveFieldValues((current) => {
      const currentValues = current[fieldId] ?? [];
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((existing) => existing !== value)
        : [...currentValues, value];
      return { ...current, [fieldId]: nextValues };
    });
  }

  function clearAll() {
    setActiveFieldValues({});
    setMinPrice("");
    setMaxPrice("");
  }

  // recompute the visible product list whenever filters or sort change
  const filteredProducts = useMemo(() => {
    const filtered = applyFilters(products, {
      fields: activeFieldValues,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
    return sortProducts(filtered, sort);
  }, [products, activeFieldValues, minPrice, maxPrice, sort]);

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
      {category.bannerUrl && (
        <div className="relative mb-6 aspect-[3/1] w-full overflow-hidden rounded-2xl bg-muted">
          <Image src={category.bannerUrl} alt="" fill sizes="100vw" className="object-cover" />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">{category.name}</h1>
          {category.description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{category.description}</p>
          )}
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredProducts.length} {t("common.products")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Sheet open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal className="size-4" />
                {t("common.filters")}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-3/4 overflow-y-auto sm:max-w-xs">
              <SheetHeader>
                <SheetTitle>{t("common.filters")}</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-4">
                <FilterSidebar {...sidebarProps} />
              </div>
            </SheetContent>
          </Sheet>

          <SortControl value={sort} onChange={setSort} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <FilterSidebar {...sidebarProps} />
        </aside>

        <div>
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
              <p className="text-sm font-medium text-foreground">{t("common.noResults")}</p>
              <p className="text-sm text-muted-foreground">{t("common.noResultsHint")}</p>
            </div>
          ) : (
            <ProductGrid>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} categoryName={category.name} />
              ))}
            </ProductGrid>
          )}
        </div>
      </div>
    </div>
  );
}