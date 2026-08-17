"use client";

import Image from "next/image";
import Link from "next/link";
import { type MouseEvent } from "react";
import { GitCompare, Heart } from "lucide-react";
import { Price } from "@/components/product/price";
import { useCompare } from "@/context/compare-context";
import { useWishlist } from "@/context/wishlist-context";
import { t } from "@/lib/i18n";
import { getDisplayVariant } from "@/lib/products";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  badge?: string;
}

export function ProductCard({ product, badge }: ProductCardProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const displayVariant = getDisplayVariant(product);
  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);
  const hasMultipleVariants = product.variants.length > 1;
  const isOutOfStock = product.variants.every((variant) => variant.stock === 0);

  const discountPercent = displayVariant.compareAtPrice
    ? Math.round(
        ((displayVariant.compareAtPrice - displayVariant.price) / displayVariant.compareAtPrice) * 100
      )
    : undefined;

  const topLeftBadge = isOutOfStock
    ? t("common.outOfStock")
    : (badge ?? (discountPercent ? `-${discountPercent}%` : undefined));

  function handleWishlistToggle(event: MouseEvent) {
    event.preventDefault();
    if (inWishlist) {
      removeFromWishlist({ productId: product.id });
    } else {
      addToWishlist({ productId: product.id });
    }
  }

  function handleCompareToggle(event: MouseEvent) {
    event.preventDefault();
    if (inCompare) {
      removeFromCompare(product.id);
    } else {
      // Silently no-ops if the 4-item cap is hit or the product is from a
      // different category than what's already being compared — same
      // simplification as the product detail page, since there's no
      // toast/notification system yet to explain why.
      addToCompare(product.id);
    }
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-background transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {topLeftBadge && (
          <span className="absolute left-2 top-2 rounded-full bg-foreground/80 px-2 py-0.5 text-[11px] font-medium text-background">
            {topLeftBadge}
          </span>
        )}

        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleWishlistToggle}
            aria-label={inWishlist ? t("common.removeFromWishlist") : t("common.addToWishlist")}
            className="flex size-8 items-center justify-center rounded-full bg-background/90 shadow-sm transition-colors hover:bg-background"
          >
            <Heart
              className={`size-4 ${inWishlist ? "fill-primary text-primary" : "text-muted-foreground"}`}
            />
          </button>

          <button
            type="button"
            onClick={handleCompareToggle}
            aria-label={inCompare ? t("common.removeFromCompare") : t("common.addToCompare")}
            className="flex size-8 items-center justify-center rounded-full bg-background/90 shadow-sm transition-colors hover:bg-background"
          >
            <GitCompare className={`size-4 ${inCompare ? "text-primary" : "text-muted-foreground"}`} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1 p-3">
        <p className="text-xs font-medium text-muted-foreground">{product.brand}</p>
        <p className="line-clamp-2 text-sm font-medium text-foreground">{product.name}</p>
        <div className="mt-1 flex items-center gap-1.5 text-sm">
          {hasMultipleVariants && (
            <span className="text-xs text-muted-foreground">{t("common.priceFrom")}</span>
          )}
          <Price price={displayVariant.price} compareAtPrice={displayVariant.compareAtPrice} />
        </div>
      </div>
    </Link>
  );
}