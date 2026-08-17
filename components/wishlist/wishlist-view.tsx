"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { Price } from "@/components/product/price";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { t } from "@/lib/i18n";
import { getDisplayVariant, getProductById, getVariantById } from "@/lib/products";

export function WishlistView() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const entries = items
    .map((item) => {
      const product = getProductById(item.productId);
      if (!product) return null;
      const variant = (item.variantId ? getVariantById(item.variantId) : undefined) ?? getDisplayVariant(product);
      return { item, product, variant };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <Heart className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">{t("wishlist.empty")}</p>
        <p className="text-sm text-muted-foreground">{t("wishlist.emptyHint")}</p>
        <Button asChild className="mt-2">
          <Link href="/">{t("common.continueShopping")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {entries.map(({ item, product, variant }) => (
        <div key={`${item.productId}-${item.variantId ?? "default"}`} className="flex items-center gap-4 py-4">
          <Link
            href={`/product/${product.slug}`}
            className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted"
          >
            <Image
              src={variant.images?.[0] ?? product.images[0]}
              alt={product.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          </Link>

          <div className="flex-1">
            <Link
              href={`/product/${product.slug}`}
              className="text-sm font-medium text-foreground hover:underline"
            >
              {product.name}
            </Link>
            <div className="mt-1">
              <Price price={variant.price} compareAtPrice={variant.compareAtPrice} className="text-sm" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => addToCart(product.id, variant.id, 1)}
              disabled={variant.stock === 0}
            >
              <ShoppingCart className="size-4" />
              {t("common.addToCart")}
            </Button>
            <button
              type="button"
              onClick={() => removeFromWishlist(item)}
              aria-label={t("common.removeFromWishlist")}
              className="text-muted-foreground hover:text-destructive"
            >
              <Heart className="size-4 fill-current" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}