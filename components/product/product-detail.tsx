"use client";

import Link from "next/link";
import { useState } from "react";
import { GitCompare, Heart, Minus, Plus, RotateCcw, ShoppingCart, Star } from "lucide-react";
import { ImageGallery } from "@/components/product/image-gallery";
import { Price } from "@/components/product/price";
import { ProductCard } from "@/components/product/product-card";
import { ProductGrid } from "@/components/product/product-grid";
import { QASection } from "@/components/product/qa-section";
import { ReviewsSection } from "@/components/product/reviews-section";
import { SpecTable } from "@/components/product/spec-table";
import { VariantSelector } from "@/components/product/variant-selector";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/context/cart-context";
import { useCompare } from "@/context/compare-context";
import { useWishlist } from "@/context/wishlist-context";
import { t } from "@/lib/i18n";
import { buildSpecRows } from "@/lib/specs";
import type { Category } from "@/types/category";
import type { Product, Variant } from "@/types/product";

interface ProductDetailProps {
  product: Product;
  category: Category;
  relatedProducts: Product[];
}

// Full product detail page: gallery, price, variant picker, add-to-cart, specs, related items.
export function ProductDetail({ product, category, relatedProducts }: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant>(
    // default to the first in-stock variant, falling back to the first variant if all are sold out
    product.variants.find((variant) => variant.stock > 0) ?? product.variants[0]
  );
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();

  const inWishlist = isInWishlist(product.id, selectedVariant.id);
  const inCompare = isInCompare(product.id);
  const isOutOfStock = selectedVariant.stock === 0;
  const images = selectedVariant.images ?? product.images;
  const specRows = buildSpecRows([{ product, variant: selectedVariant }], category);

  const discountPercent = selectedVariant.compareAtPrice
    ? Math.round(
        ((selectedVariant.compareAtPrice - selectedVariant.price) / selectedVariant.compareAtPrice) * 100
      )
    : undefined;

  function handleSelectVariant(variant: Variant) {
    setSelectedVariant(variant);
    setQuantity(1); // reset quantity since stock/context changed with the new variant
  }

  function handleAddToCart() {
    addToCart(product.id, selectedVariant.id, quantity);
  }

  function handleWishlistToggle() {
    if (inWishlist) {
      removeFromWishlist({ productId: product.id, variantId: selectedVariant.id });
    } else {
      addToWishlist({ productId: product.id, variantId: selectedVariant.id });
    }
  }

  function handleCompareToggle() {
    if (inCompare) {
      removeFromCompare(product.id);
    } else {
      // addToCompare shows a toast itself if the category doesn't match
      // what's already being compared, or the 4-item cap is reached.
      addToCompare(product.id, product.categoryId);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ImageGallery images={images} alt={product.name} badge={discountPercent ? t("common.sale") : undefined} />

        <div className="flex flex-col gap-4">
          <div>
            <Link href={`/category/${category.slug}`} className="text-sm font-medium text-primary hover:underline">
              {t(category.nameKey)}
            </Link>
            <h1 className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">{product.name}</h1>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Price price={selectedVariant.price} compareAtPrice={selectedVariant.compareAtPrice} className="text-xl" />
            {discountPercent !== undefined && (
              <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                {t("common.save")} {discountPercent}%
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="size-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <Link
              href="/policies/returns-warranty"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              {t("footer.returnsWarranty")}
            </Link>
          </div>

          <p className={`text-sm font-medium ${isOutOfStock ? "text-destructive" : "text-emerald-600"}`}>
            {isOutOfStock ? t("common.outOfStock") : t("common.inStock")}
          </p>

          <VariantSelector
            product={product}
            selectedVariant={selectedVariant}
            onSelectVariant={handleSelectVariant}
          />

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">{t("common.quantity")}</span>
            <div className="flex items-center rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                disabled={isOutOfStock || quantity <= 1}
                aria-label={t("product.decreaseQuantity")}
                className="flex size-8 items-center justify-center text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-medium text-foreground">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.min(selectedVariant.stock, current + 1))}
                disabled={isOutOfStock || quantity >= selectedVariant.stock}
                aria-label={t("product.increaseQuantity")}
                className="flex size-8 items-center justify-center text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          </div>

          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>
              {t("product.sku")}: {selectedVariant.sku}
            </span>
            <span>
              {t("product.brand")}: {product.brand}
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button
              size="lg"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="flex-1 sm:flex-none"
            >
              <ShoppingCart className="size-4" />
              {t("common.addToCart")}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleWishlistToggle}
              aria-label={inWishlist ? t("common.removeFromWishlist") : t("common.addToWishlist")}
            >
              <Heart className={`size-4 ${inWishlist ? "fill-primary text-primary" : ""}`} />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleCompareToggle}
              aria-label={inCompare ? t("common.removeFromCompare") : t("common.addToCompare")}
            >
              <GitCompare className={`size-4 ${inCompare ? "text-primary" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-10 max-w-3xl">
        <Tabs defaultValue="description">
          <TabsList className="h-auto gap-1.5 bg-transparent p-0">
            <TabsTrigger
              value="description"
              className="rounded-t-xl rounded-b-none border border-b-0 border-border bg-muted px-4 py-2.5 data-active:bg-background"
            >
              {t("product.description")}
            </TabsTrigger>
            <TabsTrigger
              value="specifications"
              className="rounded-t-xl rounded-b-none border border-b-0 border-border bg-muted px-4 py-2.5 data-active:bg-background"
            >
              {t("product.specifications")}
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-t-xl rounded-b-none border border-b-0 border-border bg-muted px-4 py-2.5 data-active:bg-background"
            >
              {t("product.reviews")}
            </TabsTrigger>
            <TabsTrigger
              value="qanda"
              className="rounded-t-xl rounded-b-none border border-b-0 border-border bg-muted px-4 py-2.5 data-active:bg-background"
            >
              {t("product.qanda")}
            </TabsTrigger>
          </TabsList>

          <div className="rounded-b-xl rounded-tr-xl border border-border p-5">
            <TabsContent value="description" className="text-sm text-muted-foreground">
              <p>{product.description}</p>
              {category.installationRequired && (
                <p className="mt-4 rounded-lg bg-muted p-3 text-foreground">
                  <span className="font-medium">{t("product.installationRequired")}:</span>{" "}
                  {t("product.installationNotice")}
                </p>
              )}
            </TabsContent>

            <TabsContent value="specifications">
              <SpecTable columns={[product.name]} rows={specRows} />
            </TabsContent>

            <TabsContent value="reviews">
              <ReviewsSection reviews={[]} />
            </TabsContent>

            <TabsContent value="qanda">
              <QASection questions={[]} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold sm:text-2xl">{t("product.similarItems")}</h2>
          <div className="mt-5">
            <ProductGrid>
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} categoryName={t(category.nameKey)} />
              ))}
            </ProductGrid>
          </div>
        </div>
      )}
    </div>
  );
}