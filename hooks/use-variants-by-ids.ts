"use client";

import { useEffect, useState } from "react";
import { getVariantsByIds } from "@/lib/products";
import type { Variant } from "@/types/product";

// Resolves cart/wishlist variant ids to full Variants for components that only hold ids
// (CartItem/WishlistItem carry no price). Ids already fetched are kept, so only new ones are
// requested, and those go out as one batched query rather than one per id. A null entry means
// the variant came back missing — deleted from the catalog since it was added.
//
// Used by the header cart links (subtotal badge), the cart drawer and the wishlist modal. All
// of them mount on every storefront page, which is why they resolve ids on demand instead of
// pulling the whole catalog through useProductCatalog.
export function useVariantsByIds(variantIds: string[]): {
  variantsById: Record<string, Variant | null>;
  hasError: boolean;
} {
  const [variantsById, setVariantsById] = useState<Record<string, Variant | null>>({});
  const [hasError, setHasError] = useState(false);
  // joined key so the effect doesn't re-run on every new array identity with the same ids
  const idsKey = variantIds.join(",");

  useEffect(() => {
    const missingIds = Array.from(new Set(idsKey.split(",").filter(Boolean))).filter(
      (id) => !(id in variantsById)
    );
    if (missingIds.length === 0) return;

    let active = true;
    getVariantsByIds(missingIds)
      .then((variants) => {
        if (!active) return;
        setHasError(false);
        setVariantsById((current) => {
          const next = { ...current };
          for (const id of missingIds) next[id] = null; // anything not returned no longer exists
          for (const variant of variants) next[variant.id] = variant;
          return next;
        });
      })
      .catch((error) => {
        console.error(error);
        if (active) setHasError(true);
      });

    return () => {
      active = false;
    };
  }, [idsKey, variantsById]);

  return { variantsById, hasError };
}
