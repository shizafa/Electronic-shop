import { SkeletonBox } from "@/components/ui/skeleton-box";
import { SkeletonText } from "@/components/ui/skeleton-text";

const THUMBNAIL_SIZE = 93;
// One full row at the desktop 3-per-row (col-lg-4) ladder, matching the real grid's usual size.
const TILE_COUNT = 6;

export function CategoryTilesSkeleton() {
  return (
    <div className="rbt-component-area rbt-catagories-area rbt-section-gap2 rbt-bg-color-white" aria-busy="true">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 pr--0">
            <div className="rbt-component-section-title d-flex justify-content-between flex-row align-items-center p-0 mb--32 mb_sm--16 border-0">
              <SkeletonBox className="h-6 w-1/2 max-w-[220px]" />
              <SkeletonBox className="h-8 w-1/3 max-w-[180px]" />
            </div>
          </div>
        </div>
        <div className="rbt-catagories-section rbt-curved-style-box rbt-catagories-section-bg-one">
          <div className="row row--12 mt_dec--24">
            <div className="col-xl-8 col-lg-12 col-12 mt--24">
              <div className="row row--12 mt_dec--24 rbt-mobile-row">
                {Array.from({ length: TILE_COUNT }).map((_, index) => (
                  <div className="col-lg-4 col-md-6 col-sm-6 col-6 mt--24" key={index}>
                    <div className="rbt-cat-box rbt-cat-box-7">
                      <div className="inner">
                        <div className="content">
                          <SkeletonBox className="h-4" style={{ width: "70%" }} />
                          <SkeletonText lines={3} className="mt-2" lineClassName="h-3" lastLineWidth="55%" />
                        </div>
                        <div className="rbt-image-portion">
                          <SkeletonBox style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-xl-4 col-lg-12 col-12 mt--24">
              <div className="rbt-cat-box banner-card text-center rbt-curved-style-box rbt-catagories-img-bg">
                <SkeletonBox className="h-full w-full" style={{ minHeight: 280 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
