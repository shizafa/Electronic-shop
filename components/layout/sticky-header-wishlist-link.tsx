"use client";

import Link from "next/link";
import { useWishlist } from "@/context/wishlist-context";

// data-bs-toggle="modal" data-bs-target="#wishlistModal" dropped — links straight to
// /wishlist. Badge only renders when non-empty (template hardcoded 7).
export function StickyHeaderWishlistLink() {
  const { items } = useWishlist();

  return (
          <li className="rbt-access-box rbt-scroll-trigger fade_in animation-order-5 rbt-wishlist d-none d-lg-flex tooltips tooltip-distance-lg" data-tooltip="Wishlist" data-tooltip-position="bottom">
            <Link className="rbt-round-btn has-rbt-md-fsize" href="/wishlist">
              <i className="fa-regular fa-heart" />
              {items.length > 0 && (
                <div className="access-box-count">
                  {items.length}
                </div>
              )}
            </Link>
          </li>
  );
}
