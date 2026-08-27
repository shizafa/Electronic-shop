"use client";

import { type MouseEvent } from "react";
import { useWishlist } from "@/context/wishlist-context";
import { t } from "@/lib/i18n";

// Just the wishlist button out of .rbt-quick-btn-grp. It sits in a different subtree from
// the cart/compare group, so it can't share a component with them.
//
// Same reasoning as ProductCardActions: isolating the wishlist subscription here means
// toggling one product's wishlist state re-renders this button rather than every card in
// the grid. The Quick View button beside it stays server-rendered — it has no handler yet.
export function ProductCardWishlistButton({ productId }: { productId: string }) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const inWishlist = isInWishlist(productId);

  function handleWishlistToggle(event: MouseEvent) {
    event.preventDefault();
    if (inWishlist) {
      removeFromWishlist({ productId });
    } else {
      addToWishlist({ productId });
    }
  }

  return (
          <button className="rbt-wishlisted-btn rbt-quick-btn tooltips" type="button" onClick={handleWishlistToggle} aria-label={inWishlist ? t("common.removeFromWishlist") : t("common.addToWishlist")} data-tooltip="Add to wishlist" data-tooltip-position="left">
            <i className={inWishlist ? "fa-solid fa-heart" : "fa-regular fa-heart"} />
          </button>
  );
}
