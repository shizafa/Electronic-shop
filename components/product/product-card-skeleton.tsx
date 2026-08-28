import { SkeletonBox } from "@/components/ui/skeleton-box";
import { SkeletonText } from "@/components/ui/skeleton-text";

const IMAGE_RATIO = { aspectRatio: "1246 / 976" };

// Mirrors ProductCard's own wrapper classes (the col ladder, .rbt-card, .rbt-card-img,
// .rbt-card-body) so the real card's padding/border-radius/spacing apply unchanged — only the
// content inside becomes shimmer blocks. That's what keeps the swap to the loaded grid at zero
// layout shift, instead of trying to hand-match the real card's dimensions.
export function ProductCardSkeleton() {
  return (
    <div className="col-xxl-3 col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6 mt--24" aria-hidden="true">
      <div className="rbt-card rbt-product-card has-hover-box-shadow">
        <div className="inner">
          <div className="rbt-card-img rbt-has-hover-img rbt-bg-color-default">
            <SkeletonBox className="w-full" style={IMAGE_RATIO} />
          </div>
          <div className="rbt-card-body">
            <SkeletonBox className="h-3" style={{ width: "40%" }} />
            <SkeletonText lines={1} lineClassName="mt-2 h-4" lastLineWidth="85%" />
            <div className="mt-2">
              <SkeletonBox className="h-3" style={{ width: "55%" }} />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <SkeletonBox className="h-5" style={{ width: "45%" }} />
              <SkeletonBox className="h-5" style={{ width: "35%" }} />
            </div>
            <div className="mt-3 flex gap-2">
              <SkeletonBox className="h-8 flex-1" />
              <SkeletonBox className="h-8 flex-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
