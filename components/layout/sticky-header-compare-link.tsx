"use client";

import Link from "next/link";
import { useCompare } from "@/context/compare-context";

// Click opens CompareModal (via CompareContext's isCompareModalOpen) instead of the original
// data-bs-toggle="modal" data-bs-target="#compareviewModal" (no Bootstrap JS loaded);
// href="/compare" stays as a no-JS fallback. Badge only renders when non-empty (template
// hardcoded 6), matching the pattern used for the main bar's cart badge.
export function StickyHeaderCompareLink() {
  const { items, openCompareModal } = useCompare();

  return (
          <li className="rbt-access-box rbt-scroll-trigger fade_in animation-order-4 tooltips tooltip-distance-lg  d-none d-lg-flex" data-tooltip="Compare" data-tooltip-position="bottom">
            <Link
              className="rbt-round-btn has-rbt-md-fsize"
              href="/compare"
              onClick={(event) => {
                event.preventDefault();
                openCompareModal();
              }}
            >
              <i className="fa-regular fa-code-compare" />
              {items.length > 0 && (
                <div className="access-box-count">
                  {items.length}
                </div>
              )}
            </Link>
          </li>
  );
}
