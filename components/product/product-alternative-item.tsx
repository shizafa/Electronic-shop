"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/currency";
import { getDisplayVariant } from "@/lib/product-helpers";
import type { Product } from "@/types/product";

const IMAGE_WIDTH = 180;
const IMAGE_HEIGHT = 180;
const IMAGE_RATIO = { aspectRatio: `${IMAGE_WIDTH} / ${IMAGE_HEIGHT}` };

// Rating renders as empty stars + (0) — same PLACEHOLDER precedent as ProductCard, since no
// rating/review data model exists yet. TODO: wire to backend
const STAR_COUNT = 5;

interface ProductAlternativeItemProps {
  product: Product;
  categoryName?: string;
  categorySlug?: string;
}

// "Alternative For This Product" mini row on the product page. Reuses the page's existing
// relatedProducts (same category) rather than a separate suggestion query. The template's
// per-category icon next to the category name (e.g. a camera icon for "Camera") is dropped —
// categories have no icon field to back it.
export function ProductAlternativeItem({ product, categoryName, categorySlug }: ProductAlternativeItemProps) {
  const { addToCart } = useCart();
  const displayVariant = getDisplayVariant(product);
  if (!displayVariant) return null; // no variants at all — nothing sellable to show
  const { id, price, compareAtPrice } = displayVariant;

  return (
    <div className="rbt-single-element d-flex align-items-center">
      <div className="rbt-card rbt-product-card rbt-list-view-variation rbt-list-view-sm rbt-prd-sing-add-card">
        <div className="inner">
          <div className="rbt-card-img rbt-bg-color-default">
            <Link href={`/product/${product.slug}`}>
              <Image
                src={product.images[0]}
                alt={product.name}
                width={IMAGE_WIDTH}
                height={IMAGE_HEIGHT}
                style={IMAGE_RATIO}
              />
            </Link>
          </div>
          <div className="rbt-card-body d-flex rbt-gap--8 align-items-center">
            <div className="left-part">
              {categoryName && (
                <Link href={`/category/${categorySlug}`} className="rbt-card-subtitle b4 rbt-card-catagories-text mt--0">
                  {categoryName}
                </Link>
              )}
              <h2 className="rbt-card-title">
                <Link href={`/product/${product.slug}`}>
                  {product.name}
                </Link>
              </h2>
            </div>
            <div className="right-part">
              <div className="rbt-card-rating">
                <ul className="rbt-rating-icon-list">
                  {Array.from({ length: STAR_COUNT }).map((_, index) => (
                    <li key={index}>
                      <i className="fa-regular fa-star" />
                    </li>
                  ))}
                </ul>
                <p className="rating-digit">
                  (0)
                </p>
              </div>
              <div className="pricing-part">
                {compareAtPrice !== undefined && (
                  <del className="price-text">
                    {formatPrice(compareAtPrice)}
                  </del>
                )}
                <span className="price-text">
                  {formatPrice(price)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="rbt-create-new-btn">
        <button className="rbt-btn rbt-btn-xs text-nowrap" type="button" onClick={() => addToCart(product.id, id, 1)}>
          ADD
          <i className="fa-solid fa-plus ml--4" />
        </button>
      </div>
    </div>
  );
}
