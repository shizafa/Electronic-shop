"use client";

import Image from "next/image";
import Link from "next/link";
import { type MouseEvent } from "react";
import { GitCompare, Heart, ShoppingCart, Star, Tag, Truck } from "lucide-react";
import { Price } from "@/components/product/price";
import { useCart } from "@/context/cart-context";
import { useCompare } from "@/context/compare-context";
import { useWishlist } from "@/context/wishlist-context";
import { t } from "@/lib/i18n";
import { getDisplayVariant } from "@/lib/product-helpers";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  badge?: string;
  categoryName?: string;
}

// Product thumbnail card used in grids/listings (home, category, search, related products).
export function ProductCard({ product, badge, categoryName }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();
  const displayVariant = getDisplayVariant(product); // representative variant used for the card's price
  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);
  const hasMultipleVariants = product.variants.length > 1;
  const isOutOfStock = product.variants.every((variant) => variant.stock === 0);

  const discountPercent = displayVariant.compareAtPrice
    ? Math.round(
        ((displayVariant.compareAtPrice - displayVariant.price) / displayVariant.compareAtPrice) * 100
      )
    : undefined;

  const topLeftBadge = isOutOfStock ? t("common.outOfStock") : (badge ?? (discountPercent ? t("common.sale") : undefined));

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
      // addToCompare shows a toast itself if the 4-item cap is hit or the
      // product is from a different category than what's already compared.
      addToCompare(product.id, product.categoryId);
    }
  }

  function handleAddToCart(event: MouseEvent) {
    event.preventDefault();
    if (isOutOfStock) return;
    addToCart(product.id, displayVariant.id);
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
          <span className="absolute top-2 left-2 rounded-full bg-destructive px-2.5 py-1 text-[11px] font-bold text-white uppercase">
            {topLeftBadge}
          </span>
        )}

        {discountPercent !== undefined && (
          <div className="absolute -top-1 -right-9 w-32 rotate-45 bg-primary py-1 text-center text-[10px] font-bold text-primary-foreground shadow-sm">
            <Tag className="mr-0.5 inline size-3" />-{discountPercent}%
          </div>
        )}

        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={inWishlist ? t("common.removeFromWishlist") : t("common.addToWishlist")}
          className="absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-full bg-background/90 shadow-sm transition-colors hover:bg-background"
        >
          <Heart className={`size-4 ${inWishlist ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </button>
      </div>

      <div className="flex flex-col gap-1 p-3">
        {categoryName && (
          <span className="text-xs font-medium text-primary">{categoryName}</span>
        )}
        <p className="line-clamp-2 text-sm font-medium text-foreground">{product.name}</p>

        <div className="mt-0.5 flex items-center gap-2">
          <div className="flex items-center gap-0.5" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="size-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Truck className="size-3" />
            {t("common.freeShipping")}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm">
          {hasMultipleVariants && (
            <span className="text-xs text-muted-foreground">{t("common.priceFrom")}</span>
          )}
          <Price price={displayVariant.price} compareAtPrice={displayVariant.compareAtPrice} />
          {discountPercent !== undefined && (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
              -{discountPercent}%
            </span>
          )}
          {!isOutOfStock && (
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
              {t("common.inStockCount").replace("{count}", String(displayVariant.stock))}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="mt-2 flex items-center justify-center gap-1.5 rounded-full border border-primary py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-primary"
        >
          <ShoppingCart className="size-3.5" />
          {t("common.addToCart")}
        </button>

        <button
          type="button"
          onClick={handleCompareToggle}
          className={`mt-1 flex items-center justify-center gap-1.5 text-xs font-medium transition-colors hover:text-primary ${inCompare ? "text-primary" : "text-muted-foreground"}`}
        >
          <GitCompare className="size-3.5" />
          {t("common.addToCompare")}
        </button>
      </div>
    </Link>
  );
}
