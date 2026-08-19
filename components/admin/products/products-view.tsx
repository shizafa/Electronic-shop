"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ProductsTable } from "@/components/admin/products/products-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { t } from "@/lib/i18n";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
}

export function ProductsView({ products, categories }: ProductsViewProps) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");

  const categoryNameById = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, t(category.nameKey)])),
    [categories]
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter((product) => {
      if (categoryId !== "all" && product.categoryId !== categoryId) return false;
      if (
        normalizedQuery &&
        !product.name.toLowerCase().includes(normalizedQuery) &&
        !product.brand.toLowerCase().includes(normalizedQuery)
      )
        return false;
      return true;
    });
  }, [products, query, categoryId]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("admin.products.searchPlaceholder")}
            className="sm:max-w-xs"
          />
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("admin.products.allCategories")}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {t(category.nameKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="size-4" />
            {t("admin.products.newProduct")}
          </Link>
        </Button>
      </div>

      <ProductsTable products={filteredProducts} categoryNameById={categoryNameById} />
    </div>
  );
}
