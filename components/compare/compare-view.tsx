"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import { SpecTable } from "@/components/product/spec-table";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/context/compare-context";
import { useProductCatalog } from "@/context/product-catalog-context";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import { getDisplayVariant } from "@/lib/product-helpers";
import { buildSpecRows, type SpecRow } from "@/lib/specs";

// CompareView — shows selected products side by side with a shared spec comparison table
export function CompareView() {
  const { items, clearCompare } = useCompare();
  const { getProductById, getCategoryById, isLoading: isCatalogLoading } = useProductCatalog();
  const [onlyDifferences, setOnlyDifferences] = useState(false);

  // drop any compared items whose product no longer exists in the catalog
  const products = items
    .map((item) => getProductById(item.productId))
    .filter((product): product is NonNullable<typeof product> => product !== undefined);

  const entries = products.map((product) => ({ product, variant: getDisplayVariant(product) }));
  const category = getCategoryById(products[0]?.categoryId ?? "");
  const specRows = buildSpecRows(entries, category); // flattens each product's specs into aligned table rows

  const introRows: SpecRow[] = [
    { id: "price", label: t("product.price"), values: entries.map(({ variant }) => formatPrice(variant.price)) },
    { id: "brand", label: t("product.brand"), values: entries.map(({ product }) => product.brand) },
  ];

  const allRows = [...introRows, ...specRows];
  const visibleRows = onlyDifferences
    ? allRows.filter((row) => new Set(row.values.map((value) => String(value))).size > 1)
    : allRows;

  if (isCatalogLoading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">{t("common.loading")}</div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-sm font-medium text-foreground">{t("compare.empty")}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{t("compare.emptyHint")}</p>
        <Button asChild className="mt-2">
          <Link href="/">{t("common.continueShopping")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-end gap-3">
          <span className="hidden -rotate-90 pb-3 text-xs whitespace-nowrap text-muted-foreground sm:inline-block">
            {t("compare.productCount").replace("{count}", String(products.length))}
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{t("nav.compare")}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t("compare.show")}</span>
            <button
              type="button"
              onClick={() => setOnlyDifferences(false)}
              className={`font-medium ${!onlyDifferences ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t("compare.showAll")}
            </button>
            <span className="text-muted-foreground">·</span>
            <button
              type="button"
              onClick={() => setOnlyDifferences(true)}
              className={`font-medium ${onlyDifferences ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t("compare.onlyDifferences")}
            </button>
          </div>

          <button
            type="button"
            onClick={clearCompare}
            className="text-sm font-medium text-primary hover:underline"
          >
            {t("compare.clearAll")}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-4">
          {products.map((product) => (
            <div key={product.id} className="w-56 shrink-0">
              <ProductCard product={product} categoryName={category ? t(category.nameKey) : undefined} />
            </div>
          ))}
        </div>
      </div>

      <SpecTable columns={products.map((product) => product.name)} rows={visibleRows} />
    </div>
  );
}
