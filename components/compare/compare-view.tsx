"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { Price } from "@/components/product/price";
import { SpecTable } from "@/components/product/spec-table";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/context/compare-context";
import { t } from "@/lib/i18n";
import { getDisplayVariant, getProductById } from "@/lib/products";
import { buildSpecRows } from "@/lib/specs";

export function CompareView() {
  const { items, removeFromCompare, clearCompare } = useCompare();

  const products = items
    .map((item) => getProductById(item.productId))
    .filter((product): product is NonNullable<typeof product> => product !== undefined);

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

  const entries = products.map((product) => ({ product, variant: getDisplayVariant(product) }));
  const specRows = buildSpecRows(entries);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold sm:text-3xl">{t("nav.compare")}</h1>
        <button
          type="button"
          onClick={clearCompare}
          className="text-sm font-medium text-primary hover:underline"
        >
          {t("compare.clearAll")}
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-4">
          {entries.map(({ product, variant }) => (
            <div
              key={product.id}
              className="flex w-44 shrink-0 flex-col gap-2 rounded-lg border border-border p-3"
            >
              <button
                type="button"
                onClick={() => removeFromCompare(product.id)}
                aria-label={t("common.removeFromCompare")}
                className="self-end text-muted-foreground hover:text-destructive"
              >
                <X className="size-4" />
              </button>

              <Link
                href={`/product/${product.slug}`}
                className="relative aspect-square overflow-hidden rounded-lg bg-muted"
              >
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="176px"
                  className="object-cover"
                />
              </Link>

              <Link
                href={`/product/${product.slug}`}
                className="text-sm font-medium text-foreground hover:underline"
              >
                {product.name}
              </Link>

              <Price price={variant.price} compareAtPrice={variant.compareAtPrice} className="text-sm" />
            </div>
          ))}
        </div>
      </div>

      <SpecTable columns={products.map((product) => product.name)} rows={specRows} />
    </div>
  );
}