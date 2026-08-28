import { SkeletonBox } from "@/components/ui/skeleton-box";
import { SkeletonText } from "@/components/ui/skeleton-text";

const IMAGE_RATIO = { aspectRatio: "278 / 212" };

// Mirrors ProductListCard's "grid" variant wrapper classes so the real card's box model
// (padding, curved corners, the col-lg-6 column) applies unchanged around the shimmer content.
export function ProductListCardSkeleton() {
  return (
    <div className="col-lg-6 col-md-6 col-sm-6 col-12 mt--24" aria-hidden="true">
      <div className="rbt-card rbt-product-card rbt-list-view-variation rbt-list-view-sm">
        <div className="inner">
          <div className="rbt-card-body">
            <SkeletonBox className="h-3" style={{ width: "45%" }} />
            <SkeletonText lines={1} lineClassName="mt-2 h-4" lastLineWidth="90%" />
            <div className="mt-2">
              <SkeletonBox className="h-4" style={{ width: "35%" }} />
            </div>
          </div>
          <div className="rbt-card-img rbt-bg-color-default rbt-curved-style-box">
            <SkeletonBox className="w-full" style={IMAGE_RATIO} />
          </div>
        </div>
      </div>
    </div>
  );
}
