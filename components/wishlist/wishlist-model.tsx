"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import { getDisplayVariant } from "@/lib/product-helpers";
import { getProductById, getVariantById } from "@/lib/products";
import type { Product, Variant } from "@/types/product";

// Wishlist quick-view modal, opened by the header's heart icon (sticky-header-wishlist-link.tsx)
// via WishlistContext's isWishlistModalOpen. The pasted markup is a Bootstrap modal
// (data-bs-dismiss, modal fade) but no Bootstrap JS is loaded (per project rules), so show/hide
// is rebuilt with useState: the "show" class + inline display (Bootstrap's own JS sets that
// inline, there's no CSS rule for it) on the modal, plus a manually-rendered .modal-backdrop
// (bootstrap.min.css ships that class's CSS, just not the JS that used to insert it). Backdrop
// click and Escape both close it, matching normal Bootstrap modal behavior.
//
// Resolves wishlist entries itself (per-id product/variant lookups, same pattern as
// cart-side-nav.tsx) rather than useProductCatalog — this modal mounts on every storefront
// page via app/(site)/layout.tsx, and useProductCatalog fetches the *whole* catalog, which
// product-catalog-context.tsx deliberately keeps scoped to cart/wishlist/compare/checkout only.
export function WishlistModal() {
  const { items, isWishlistModalOpen, closeWishlistModal, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [productsById, setProductsById] = useState<Record<string, Product | null>>({});
  const [variantsById, setVariantsById] = useState<Record<string, Variant | null>>({});

  useEffect(() => {
    const missingProductIds = items.map((item) => item.productId).filter((id) => !(id in productsById));
    const missingVariantIds = items
      .map((item) => item.variantId)
      .filter((id): id is string => !!id && !(id in variantsById));
    if (missingProductIds.length === 0 && missingVariantIds.length === 0) return;

    let active = true;
    Promise.all([
      Promise.all(missingProductIds.map((id) => getProductById(id))),
      Promise.all(missingVariantIds.map((id) => getVariantById(id))),
    ]).then(([products, variants]) => {
      if (!active) return;
      setProductsById((current) => {
        const next = { ...current };
        products.forEach((product, index) => {
          next[missingProductIds[index]] = product ?? null;
        });
        return next;
      });
      setVariantsById((current) => {
        const next = { ...current };
        variants.forEach((variant, index) => {
          next[missingVariantIds[index]] = variant ?? null;
        });
        return next;
      });
    });

    return () => {
      active = false;
    };
  }, [items, productsById, variantsById]);

  useEffect(() => {
    if (!isWishlistModalOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeWishlistModal();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWishlistModalOpen, closeWishlistModal]);

  // Falls back to the product's default display variant when the wishlist entry didn't save a
  // specific one (same fallback wishlist-view.tsx uses); drops entries whose product/variant no
  // longer exists in the catalog
  const entries = items
    .map((item) => {
      const product = productsById[item.productId];
      if (!product) return null;
      const variant = item.variantId ? variantsById[item.variantId] : getDisplayVariant(product);
      if (!variant) return null;
      return { item, product, variant };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const isResolving = items.some((item) => {
    if (!(item.productId in productsById)) return true;
    if (item.variantId && !(item.variantId in variantsById)) return true;
    return false;
  });

  return (
    <>
      {isWishlistModalOpen && <div className="modal-backdrop fade show" onClick={closeWishlistModal} />}
      <div
        className={`rbt-default-modal modal fade has-rbt-top-folder-shape${isWishlistModalOpen ? " show" : ""}`}
        id="wishlistModal"
        style={{ display: isWishlistModalOpen ? "block" : "none" }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wishlistModalLabel"
        aria-hidden={!isWishlistModalOpen}
      >
        <div className="modal-dialog sm-size modal-dialog-centered">
          <div className="modal-content">
            <div className="rbt-folder-shape-right-portion">
              <svg xmlns="http://www.w3.org/2000/svg" width="85" height="90" viewBox="0 0 85 90" fill="none">
                <path d="M0 0H11.1844C14.5695 0 17.7971 1.42971 20.0716 3.93671L82.1927 72.4059C83.9992 74.397 84.9999 76.9893 84.9999 79.6778C84.9999 85.6547 85.0001 90 85.0001 90H0V0Z" fill="white" />
              </svg>
            </div>
            <div className="modal-header">
              <button type="button" className="rbt-round-btn rbt-modal-dis-btn" onClick={closeWishlistModal} aria-label="Close">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="rbt-top-folder-shape-wrapper">
              <div className="rbt-bg-color-white rbt-content-trs-portion">
                <div className="rbt-wishlist-modal-content">
                  <div className="rbt-title rbt-text-bold h5" id="wishlistModalLabel">
                    Product Wishlist
                  </div>
                  {isResolving ? (
                    <p className="mb--16">{t("common.loading")}</p>
                  ) : entries.length === 0 ? (
                    <p className="mb--16">{t("wishlist.empty")}</p>
                  ) : (
                    <div className="rbt-transparent-table-one-wrapper rbt-has-bg-gray pt--0 pb--0 mb--16">
                      <table className="rbt-transparent-table-one mb--0 rbt-wishlist-table">
                        <tbody>
                          {entries.map(({ item, product, variant }) => (
                            <tr key={`${item.productId}-${item.variantId ?? "default"}`}>
                              <td className="rbt-product-remove-btn-wrapper">
                                <button
                                  className="rbt-product-remove-btn rbt-round-btn"
                                  type="button"
                                  onClick={() => removeFromWishlist(item)}
                                >
                                  <span>
                                    <i className="fa-solid fa-xmark" />
                                  </span>
                                </button>
                              </td>
                              <td className="product-thumbnail">
                                <Link href={`/product/${product.slug}`} onClick={closeWishlistModal}>
                                  <Image
                                    src={variant.images?.[0] ?? product.images[0]}
                                    alt={product.name}
                                    width={140}
                                    height={107}
                                  />
                                </Link>
                              </td>
                              <td className="rbt-wish-product-info">
                                <div className="rbt-wish-product-name h6">
                                  <Link href={`/product/${product.slug}`} onClick={closeWishlistModal}>
                                    {product.name}
                                  </Link>
                                </div>
                                <div className="rbt-product-price-text rbt-text-color-primary">
                                  <span>
                                    {formatPrice(variant.price)}
                                  </span>
                                </div>
                                <span className="rbt-product-id">
                                  <span className="rbt-text-semi-bold">
                                    {t("product.sku")}:
                                  </span>
                                  #{variant.sku}
                                </span>
                              </td>
                              <td>
                                <div className="rbt-button-group">
                                  <button
                                    type="button"
                                    className="rbt-btn rbt-btn-sm has-left-icon"
                                    disabled={variant.stock === 0}
                                    onClick={() => addToCart(product.id, variant.id, 1)}
                                  >
                                    <i className="fa-regular fa-cart-shopping" />
                                    Add To Cart
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="rbt-wishlist-modal-footer d-flex flex-wrap rbt-gap--16 justify-content-between align-items-center">
                    <Link href="/wishlist" className="rbt-link" onClick={closeWishlistModal}>
                      <span className="icon mr--4">
                        <i className="fa-sharp fa-regular fa-heart" />
                      </span>
                      Open wishlist page
                    </Link>
                    <Link href="/shop" className="rbt-link" onClick={closeWishlistModal}>
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
