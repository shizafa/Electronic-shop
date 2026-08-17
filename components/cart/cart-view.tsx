"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Price } from "@/components/product/price";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import { formatVariantLabel, getProductById, getVariantById } from "@/lib/products";

export function CartView() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, updateQuantity, removeFromCart } = useCart();

  const lineItems = items
    .map((item) => {
      const product = getProductById(item.productId);
      const variant = getVariantById(item.variantId);
      if (!product || !variant) return null;
      return { item, product, variant };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const subtotal = lineItems.reduce((sum, { variant, item }) => sum + variant.price * item.quantity, 0);
  const shippingFee = 0;
  const total = subtotal + shippingFee;

  function handleCheckout() {
    router.push(user ? "/checkout" : "/login?redirect=/checkout");
  }

  if (lineItems.length === 0) {
    return (
      <div className="container-page flex flex-col items-center gap-2 py-20 text-center">
        <p className="text-lg font-medium text-foreground">{t("cart.empty")}</p>
        <p className="text-sm text-muted-foreground">{t("cart.emptyHint")}</p>
        <Button asChild className="mt-4">
          <Link href="/">{t("common.continueShopping")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl font-semibold sm:text-3xl">{t("cart.heading")}</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col divide-y divide-border">
          {lineItems.map(({ item, product, variant }) => (
            <div key={item.variantId} className="flex gap-4 py-4">
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

              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/product/${product.slug}`}
                      className="text-sm font-medium text-foreground hover:underline"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatVariantLabel(product, variant)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("product.sku")}: {variant.sku}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.variantId)}
                    aria-label={t("common.remove")}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-border">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      aria-label={t("product.decreaseQuantity")}
                      className="flex size-7 items-center justify-center text-foreground hover:bg-muted"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-7 text-center text-sm font-medium text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.variantId, Math.min(variant.stock, item.quantity + 1))
                      }
                      disabled={item.quantity >= variant.stock}
                      aria-label={t("product.increaseQuantity")}
                      className="flex size-7 items-center justify-center text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>

                  <Price price={variant.price * item.quantity} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-border p-5">
          <p className="text-sm font-semibold text-foreground">{t("cart.orderSummary")}</p>

          <div className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{t("common.subtotal")}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>{t("common.shippingFee")}</span>
              <span>{shippingFee === 0 ? t("common.free") : formatPrice(shippingFee)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
              <span>{t("common.total")}</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Button size="lg" className="mt-5 w-full" onClick={handleCheckout}>
            {t("common.checkout")}
          </Button>
        </div>
      </div>
    </div>
  );
}