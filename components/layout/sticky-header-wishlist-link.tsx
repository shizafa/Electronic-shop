"use client";

import Link from "next/link";
import { useWishlist } from "@/context/wishlist-context";

// Click opens WishlistModal (via WishlistContext's isWishlistModalOpen) instead of the
// original data-bs-toggle="modal" data-bs-target="#wishlistModal" (no Bootstrap JS loaded);
// href="/wishlist" stays as a no-JS fallback. Badge only renders when non-empty (template
// hardcoded 7).
export function StickyHeaderWishlistLink() {
  const { items, openWishlistModal } = useWishlist();

  return (
          <li className="rbt-access-box rbt-scroll-trigger fade_in animation-order-5 rbt-wishlist d-none d-lg-flex tooltips tooltip-distance-lg" data-tooltip="Wishlist" data-tooltip-position="bottom">
            <Link
              className="rbt-round-btn has-rbt-md-fsize"
              href="/wishlist"
              onClick={(event) => {
                event.preventDefault();
                openWishlistModal();
              }}
            >
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
