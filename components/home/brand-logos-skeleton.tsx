import { SkeletonBox } from "@/components/ui/skeleton-box";

// Template ships exactly 10 brand tiles (see brand-logos-loader.ts).
const BRAND_COUNT = 10;

export function BrandLogosSkeleton() {
  return (
    <div className="rbt-component-area rbt-catagories-area rbt-section-gap2 rbt-bg-color-gray-light" aria-busy="true">
      <div className="container">
        <div className="rbt-brand-style-one rbt-fshape-box-outline-style rbt-fshape-box-outline-style-extend-width">
          <div className="row">
            <div className="col-lg-12">
              <div className="rbt-component-section-title text-left">
                <SkeletonBox className="h-6" style={{ width: "180px" }} />
              </div>
            </div>
          </div>
          <div className="rbt-fshape-box rbt-fshape-box-py-inc">
            <div className="row row--12 mt_dec--24">
              {Array.from({ length: BRAND_COUNT }).map((_, index) => (
                <div className="col-lg-1-5 col-lg-4 col-md-4 col-sm-6 col-6 mt--24" key={index}>
                  <div className="rbt-brand text-center style-one">
                    <div className="rbt-brand-inner">
                      <div className="brand-image">
                        <SkeletonBox className="h-10 w-full" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
