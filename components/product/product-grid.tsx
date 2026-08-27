import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { ProductCard } from "@/components/product/product-card";

// One row at the widest breakpoint (col-xxl-3 => 4 per row), i.e. the cards that are above
// the fold on load and shouldn't be lazy.
//
// This is a desktop assumption. On mobile the ladder is col-6, so only ~2 cards are above
// the fold and the other 2 get preloaded unnecessarily. Accepted for now — the cost is two
// eagerly fetched images, not a layout problem.
const PRIORITY_CARD_COUNT = 4;

// Row wrapper for ProductCards. Each card's root is a Bootstrap column (col-xxl-3,
// col-xl-3, ...), so the responsive column count comes from the card itself — this only
// has to provide the .row flex context those columns require, and mark the first row of
// cards as priority so their images aren't lazy-loaded.
interface ProductGridProps {
  children: ReactNode;
  // How many leading cards to mark as priority. A grid can't tell whether it is the first
  // one on the page, so any grid that renders below the fold — a second homepage section,
  // the related-products rail on a product page — should pass 0 to avoid preloading
  // images the visitor may never scroll to.
  priorityCount?: number;
}

export function ProductGrid({ children, priorityCount = PRIORITY_CARD_COUNT }: ProductGridProps) {
  return (
    <div className="row">
      {Children.map(children, (child, index) =>
        // Only ProductCard understands `priority`; anything else a caller nests here is
        // passed through untouched rather than being given a prop it doesn't declare.
        index < priorityCount && isValidElement<{ priority?: boolean }>(child) && child.type === ProductCard
          ? cloneElement(child, { priority: true })
          : child
      )}
    </div>
  );
}
