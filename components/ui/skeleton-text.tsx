interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lineClassName?: string;
  lastLineWidth?: string;
}

// A run of text-line placeholders. The last line defaults to a shorter width so a multi-line
// skeleton reads as text (ragged right edge) instead of a stack of identical bars.
export function SkeletonText({
  lines = 1,
  className = "",
  lineClassName = "h-3",
  lastLineWidth = "70%",
}: SkeletonTextProps) {
  return (
    <div aria-hidden="true" className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`skeleton-shimmer rounded-full ${lineClassName}`}
          style={{ width: lines > 1 && index === lines - 1 ? lastLineWidth : "100%" }}
        />
      ))}
    </div>
  );
}
