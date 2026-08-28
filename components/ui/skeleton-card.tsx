import type { CSSProperties } from "react";
import { SkeletonBox } from "@/components/ui/skeleton-box";
import { SkeletonText } from "@/components/ui/skeleton-text";

interface SkeletonCardProps {
  className?: string;
  imageClassName?: string;
  imageStyle?: CSSProperties;
  lines?: number;
  textClassName?: string;
}

// Generic "image + a few lines" skeleton shape, shared by simpler cards (brand tiles, list
// cards). Layouts with more structure — ProductCard's rating/price/action-button rows — compose
// SkeletonBox/SkeletonText directly instead of forcing this shape to fit them.
export function SkeletonCard({
  className = "",
  imageClassName = "",
  imageStyle,
  lines = 2,
  textClassName = "mt-3",
}: SkeletonCardProps) {
  return (
    <div className={className}>
      <SkeletonBox className={`w-full ${imageClassName}`} style={imageStyle} />
      <SkeletonText lines={lines} className={textClassName} />
    </div>
  );
}
