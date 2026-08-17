"use client";

import { useState } from "react";
import { GitCompare, Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { AccordionSection } from "@/components/product/accordion-section";
import { ImageGallery } from "@/components/product/image-gallery";
import { Price } from "@/components/product/price";
import { ProductCard } from "@/components/product/product-card";
import { ProductGrid } from "@/components/product/product-grid";
import { SpecTable } from "@/components/product/spec-table";
import { VariantSelector } from "@/components/product/variant-selector";
import { Button } from "@/components/ui/button";
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
  const specRows = buildSpecRows([{ product, variant: selectedVariant }]);

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
      // If the category doesn't match what's already being compared, or the
      // 4-item cap is reached, this is a silent no-op — there's no toast/
      // notification system yet to explain why, so the button just won't
      // toggle rather than doing something misleading.
      addToCompare(product.id);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ImageGallery images={images} alt={product.name} />

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{product.brand}</p>
            <h1 className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">{product.name}</h1>
          </div>

          <Price
            price={selectedVariant.price}
            compareAtPrice={selectedVariant.compareAtPrice}
            className="text-xl"
          />

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

          <p className="text-xs text-muted-foreground">
            {t("product.sku")}: {selectedVariant.sku}
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
        <AccordionSection title={t("product.description")} defaultOpen>
          <p>{product.description}</p>
        </AccordionSection>

        <AccordionSection title={t("product.specifications")} defaultOpen>
          <SpecTable columns={[product.name]} rows={specRows} />
        </AccordionSection>

        {category.installationRequired && (
          <AccordionSection title={t("product.installationRequired")} defaultOpen>
            <p>{t("product.installationNotice")}</p>
          </AccordionSection>
        )}

        <AccordionSection title={t("product.qanda")}>
          <p>{t("product.qandaPlaceholder")}</p>
        </AccordionSection>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold sm:text-2xl">{t("product.relatedProducts")}</h2>
          <div className="mt-5">
            <ProductGrid>
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </ProductGrid>
          </div>
        </div>
      )}
    </div>
  );
}