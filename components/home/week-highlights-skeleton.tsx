import { ProductListCardSkeleton } from "@/components/product/product-list-card-skeleton";
import { SkeletonBox } from "@/components/ui/skeleton-box";

// Matches WeekHighlights' HIGHLIGHT_COUNT (6), 2-per-row.
const HIGHLIGHT_COUNT = 6;

export function WeekHighlightsSkeleton() {
  return (
    <div
      id="rbt-product-block-03"
      className="rbt-component-area rbt-catagories-area rbt-section-gap2 rbt-bg-color-gray-light"
      aria-busy="true"
    >
      <div className="container">
        <div className="row row--12 mt_dec--24">
          <div className="col-xl-6 col-lg-12 col-md-12 col-12 mt--24">
            <div className="rbt-fshape-box-outline-style rbt-fshape-box-outline-style-bg-white rbt-fshape-box-outline-style-sm-size">
              <div className="row">
                <div className="col-lg-12">
                  <div className="rbt-component-section-title">
                    <SkeletonBox className="h-6 w-1/2 max-w-[240px]" />
                  </div>
                </div>
              </div>
              <div className="rbt-fshape-box">
                <div className="row row--12 mt_dec--24 rbt-card-row-has-top-separator rbt-two-align-card-row">
                  {Array.from({ length: HIGHLIGHT_COUNT }).map((_, index) => (
                    <ProductListCardSkeleton key={index} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-6 col-lg-12 col-md-12 col-12 mt--24 pt--44 pt_sm--0 pt_lg--0 pt_md--0">
            <div className="rbt-product-banner rbt-product-banner-style-two rbt-curved-style-box h-100">
              <SkeletonBox className="h-full w-full" style={{ minHeight: 400 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
