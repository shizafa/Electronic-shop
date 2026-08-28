import type { CSSProperties } from "react";

interface SkeletonBoxProps {
  className?: string;
  style?: CSSProperties;
}

// Base shimmer block for skeleton loading states. Sizing/shape (width, height, aspect-ratio,
// border-radius) comes entirely from the caller via className/style so it can stand in for
// any real element's box — that's what keeps the swap to real content at zero layout shift.
export function SkeletonBox({ className = "", style }: SkeletonBoxProps) {
  return <div aria-hidden="true" className={`skeleton-shimmer rounded-lg ${className}`} style={style} />;
}
