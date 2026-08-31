import { ProductCardSkeleton } from "@/components/product/product-card-skeleton";
import { SkeletonBox } from "@/components/ui/skeleton-box";

// Matches DealsOfTheDay's per-tab TAB_PRODUCT_LIMIT (8), 4-per-row at the widest breakpoint.
const CARD_COUNT = 8;
const TAB_LABELS = ["Best Sellers", "New Arrivals", "On Sale"];

export function DealsOfTheDaySkeleton() {
  return (
    <div
      id="rbt-product-block-01"
      className="rbt-component-area rbt-catagories-area rbt-section-gap2 rbt-bg-color-gray-light"
      aria-busy="true"
    >
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="rbt-component-section-title d-flex flex-row justify-content-between align-items-center p-0 mb--32 mb_sm--16 border-0">
              <SkeletonBox className="h-6 w-1/2 max-w-[200px]" />
              <div className="flex gap-2">
                {TAB_LABELS.map((label) => (
                  <SkeletonBox key={label} className="h-8 flex-1 max-w-[110px]" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="row row--12 mt_dec--24">
          {Array.from({ length: CARD_COUNT }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
