import Link from "next/link";
import { ProductCardActions } from "@/components/product/product-card-actions";
import { ProductCardDetails } from "@/components/product/product-card-details";
import { ProductCardHoverImage } from "@/components/product/product-card-hover-image";
import { ProductCardQuickViewButton } from "@/components/product/product-card-quick-view-button";
import { ProductCardTextSwiper } from "@/components/product/product-card-text-swiper";
import { ProductCardWishlistButton } from "@/components/product/product-card-wishlist-button";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import { getDisplayVariant } from "@/lib/product-helpers";
import type { Product } from "@/types/product";

// Every value in the template's card markup that still has no field behind it. Kept in one
// block (rather than inline in the JSX) so the whole backlog is visible in one place.
// Rating/review count are real data now (product.averageRating/reviewCount) — see the
// rbt-card-rating block below — everything else here is still template demo content.
// TODO: wire to backend
const PLACEHOLDER = {
  newBadge: "NEW",
  starCount: 5,
  emptyStarIcon: "fa-regular fa-star",
  shipsLabel: "Ships :",
  shipsText: "2–3 weeks Free Shipping",
  shipsLink: "Get delivery dates",
  pickupLabel: "Pickup :",
  pickupLink: "Check Availability",
};

// The demo product images the template ships with are 1246x976; next/image needs explicit
// intrinsic dimensions here because the template's containers take their height from the image.
const IMAGE_WIDTH = 1246;
const IMAGE_HEIGHT = 976;

// The template's `.rbt-card-img a img` rule sets width:100% and object-fit:cover but no
// height — it gets away with that because every demo image is exactly IMAGE_WIDTH x
// IMAGE_HEIGHT. Real product photos vary, so without pinning the ratio each card's image
// box (and therefore the whole card) ends up a different height. Locking it to the demo
// ratio lets the template's existing object-fit:cover do the cropping.
const IMAGE_RATIO = { aspectRatio: `${IMAGE_WIDTH} / ${IMAGE_HEIGHT}` };

// Matches the card's Bootstrap column ladder exactly:
//   col-6 / col-sm-6 / col-md-6  -> 50vw  (up to 991px)
//   col-lg-4                     -> 33vw  (992-1199px)
//   col-xl-3 / col-xxl-3         -> 25vw  (1200px+)
// TODO: revisit after the layout port — once the Tailwind container-page wrappers are
// replaced by the template's Bootstrap containers, a fixed px cap at the widest breakpoint
// (e.g. "(min-width: 1400px) 320px") will be worth adding, since the content width will
// then be known and stable.
const IMAGE_SIZES = "(max-width: 991px) 50vw, (max-width: 1199px) 33vw, 25vw";

interface ProductCardProps {
  product: Product;
  badge?: string;
  categoryName?: string;
  categorySlug?: string;
  // Set by ProductGrid for the first row of cards, which are above the fold on load.
  priority?: boolean;
}

// Product thumbnail card used in grids/listings (home, category, search, related products).
//
// This is a server component. The interactive pieces live in three sibling client
// components (product-card-actions, product-card-wishlist-button, product-card-details)
// because they sit in three different subtrees of the template markup and can't share one.
//
// The reason for the split is re-render scope rather than bundle size: most callers are
// already client components, so the card reaches the browser regardless. What matters is
// that the cart/wishlist/compare subscriptions now sit on small leaves. Previously every
// card subscribed to all three contexts, so one cart update re-rendered every card in the
// grid in full; now it re-renders only the button that cares.
export function ProductCard({ product, badge, categoryName, categorySlug, priority = false }: ProductCardProps) {
  const displayVariant = getDisplayVariant(product); // representative variant used for the card's price
  if (!displayVariant) return null; // no variants at all — nothing sellable to show
  const hasMultipleVariants = product.variants.length > 1;
  const isOutOfStock = product.variants.every((variant) => variant.stock === 0);

  // Products without a second image reuse the first, so the hover swap is a no-op rather than a gap.
  const hoverImage = product.images[1] ?? product.images[0];

  // The template's spec list is 4 rows: brand, then three specs. A 4th spec, when the product
  // has one, fills the continuation line the template's last row carries.
  const specEntries = Object.entries(product.specs);
  const specRows = specEntries.slice(0, 3);
  const specContinuation = specEntries[3];

  return (
      <div className="col-xxl-3 col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6 mt--24">
  <div className="rbt-card rbt-product-card has-hover-box-shadow">
    <div className="inner rbt-scroll-trigger fade_in animation-order-2">
      <div className="rbt-card-img rbt-has-hover-img rbt-bg-color-default">
        <Link href={`/product/${product.slug}`}>
          <ProductCardHoverImage
            src={product.images[0]}
            hoverSrc={hoverImage}
            alt={product.name}
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            sizes={IMAGE_SIZES}
            style={IMAGE_RATIO}
            priority={priority}
          />
        </Link>
        <div className="rbt-badge-wrapper rbt-content-top-left">
          {(isOutOfStock || !badge) && (
            <div className="rbt-product-badge rbt-product-badge-bg-green border-rounded">
              {isOutOfStock ? t("common.outOfStock") : PLACEHOLDER.newBadge}
            </div>
          )}
          {badge && (
            <div className="rbt-product-badge rbt-product-badge-bg-secondary-gradient border-rounded">
              {badge}
            </div>
          )}
        </div>
        <div className="rbt-quick-btn-grp has-mixup-midlayer bottom-right--position">
          <ProductCardQuickViewButton product={product} categoryName={categoryName} categorySlug={categorySlug} />
          <ProductCardWishlistButton productId={product.id} />
        </div>
      </div>
      <div className="rbt-card-body">
        {categoryName && (
          <Link href={`/category/${categorySlug}`} className="rbt-card-subtitle rbt-card-catagories-text">
            {categoryName}
          </Link>
        )}
        <h2 className="rbt-card-title">
          <Link href={`/product/${product.slug}`}>
            {product.name}
          </Link>
        </h2>
        <div className="rbt-card-rating">
          <ul className="rbt-rating-icon-list">
            {Array.from({ length: PLACEHOLDER.starCount }).map((_, index) => (
              <li key={index}>
                <i
                  className={
                    index < Math.round(product.averageRating)
                      ? "fa-solid fa-star rbt-rated-icon"
                      : PLACEHOLDER.emptyStarIcon
                  }
                />
              </li>
            ))}
          </ul>
          <p className="rating-digit">
            ({product.reviewCount})
          </p>
          <ProductCardTextSwiper />
        </div>
        <div className="pricing-part">
          <span className="price-text">
            {hasMultipleVariants && `${t("common.priceFrom")} `}
            {formatPrice(displayVariant.price)}
          </span>
          {!isOutOfStock && (
            <div className="rbt-badge rbt-badge-bg-green rbt-badge-border rbt-badge-small rbt-badge-rounded">
              {t("common.inStockCount").replace("{count}", String(displayVariant.stock))}
            </div>
          )}
        </div>
        <ProductCardActions
          productId={product.id}
          variantId={displayVariant.id}
          categoryId={product.categoryId}
          isOutOfStock={isOutOfStock}
        />
      </div>
    </div>
    <ProductCardDetails>
      <div className="wrapper rbt-has-show-more-inner-content">
        <ul className="product-details-list">
          <li>
            <span className="rbt-bold--text">
              {t("common.brand")} :
            </span>
            <span className="text">
              {product.brand}
            </span>
          </li>
          {specRows.map(([specKey, specValue], index) => (
            <li key={specKey}>
              <span className="rbt-bold--text">
                {specKey} :
              </span>
              <span className="text">
                {String(specValue)}
              </span>
              {index === specRows.length - 1 && specContinuation && (
                <span className="text d-block">
                  {String(specContinuation[1])}
                </span>
              )}
            </li>
          ))}
        </ul>
        <ul className="product-details-list shipment-details-list">
          <li>
            <span className="icon">
              <i className="fa-sharp fa-regular fa-truck" />
            </span>
            <div className="right-content">
              <span className="rbt-bold--text">
                {PLACEHOLDER.shipsLabel}
              </span>
              <span className="text">
                {PLACEHOLDER.shipsText}
              </span>
              <br />
              <a href="#" className="shipment-quick-link rbt-btn-link">
                {PLACEHOLDER.shipsLink}
              </a>
            </div>
          </li>
          <li>
            <span className="icon">
              <i className="fa-regular fa-bag-shopping" />
            </span>
            <div className="right-content">
              <span className="rbt-bold--text">
                {PLACEHOLDER.pickupLabel}
              </span>
              <a href="#" className="shipment-quick-link rbt-btn-link">
                {PLACEHOLDER.pickupLink}
              </a>
            </div>
          </li>
        </ul>
      </div>
    </ProductCardDetails>
  </div>
{/* End Single Card */}
</div>
  );
}
