import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/currency";
import { getDisplayVariant } from "@/lib/product-helpers";
import type { Product, Variant } from "@/types/product";

const IMAGE_WIDTH = 278;
const IMAGE_HEIGHT = 212;
const IMAGE_RATIO = { aspectRatio: `${IMAGE_WIDTH} / ${IMAGE_HEIGHT}` };

// Rating renders as empty stars + (0) — same PLACEHOLDER precedent as ProductCard, since no
// rating/review data model exists yet. TODO: wire to backend
const STAR_COUNT = 5;

type ProductListCardVariant = "grid" | "preview";

// "grid" is the homepage "This Week's Highlights" list (needs its own Bootstrap column).
// "preview" is the product-page prev/next hover dropdown (no column — it's the dropdown's
// only child, and swaps rbt-curved-style-box for rbt-bg-color-gray-light on the root).
const ROOT_CLASS: Record<ProductListCardVariant, string> = {
  grid: "rbt-card rbt-product-card rbt-list-view-variation rbt-list-view-sm",
  preview: "rbt-card rbt-product-card rbt-list-view-variation rbt-list-view-sm rbt-bg-color-gray-light",
};

const IMAGE_WRAPPER_CLASS: Record<ProductListCardVariant, string> = {
  grid: "rbt-card-img rbt-bg-color-default rbt-curved-style-box",
  preview: "rbt-card-img rbt-bg-color-default",
};

interface ProductListCardProps {
  product: Product;
  variant?: ProductListCardVariant;
}

function ProductListCardBody({
  product,
  variant,
  displayVariant,
}: Required<ProductListCardProps> & { displayVariant: Variant }) {
  const { price, compareAtPrice } = displayVariant;

  return (
    <div className={ROOT_CLASS[variant]}>
      <div className="inner rbt-scroll-trigger fade_in animation-order-1">
        <div className="rbt-card-body">
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
          <h2 className="rbt-card-title h6">
            <Link href={`/product/${product.slug}`}>
              {product.name}
            </Link>
          </h2>
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
        <div className={IMAGE_WRAPPER_CLASS[variant]}>
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
      </div>
    </div>
  );
}

export function ProductListCard({ product, variant = "grid" }: ProductListCardProps) {
  const displayVariant = getDisplayVariant(product);
  if (!displayVariant) return null; // no variants at all — nothing sellable to show

  if (variant === "preview") {
    return <ProductListCardBody product={product} variant={variant} displayVariant={displayVariant} />;
  }

  return (
    <div className="col-lg-6 col-md-6 col-sm-6 col-12 mt--24">
      <ProductListCardBody product={product} variant={variant} displayVariant={displayVariant} />
    </div>
  );
}
