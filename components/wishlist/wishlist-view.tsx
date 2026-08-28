"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { useProductCatalog } from "@/context/product-catalog-context";
import { useWishlist } from "@/context/wishlist-context";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import { getDisplayVariant } from "@/lib/product-helpers";

// WishlistView — /wishlist page. useProductCatalog resolves stored wishlist items
// (product/variant ids) into full product + variant data; this route's own layout.tsx
// (app/(site)/wishlist/layout.tsx) scopes that catalog fetch to here.
//
// The social-share icons and "Wishlist link" copy field at the bottom are decorative/inert —
// no share-link backend exists for wishlists, same treatment already given to the identical
// copy-to-clipboard widgets in cart-view.tsx's coupon section.
export function WishlistView() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { getProductById, getVariantById, isLoading: isCatalogLoading } = useProductCatalog();

  // resolve wishlist entries into product/variant data; fall back to the product's default
  // display variant if no specific variant was saved, and drop items whose product is gone
  const entries = items
    .map((item) => {
      const product = getProductById(item.productId);
      if (!product) return null;
      const variant = (item.variantId ? getVariantById(item.variantId) : undefined) ?? getDisplayVariant(product);
      if (!variant) return null; // product has no variants at all — nothing sellable to show
      return { item, product, variant };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return (
    <div className="rbt-component-area rbt-wishlist-area rbt-section-gap2Bottom">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="rbt-component-section-title rbt-gap--4 mb--40 mt--8 p-0 border-0 text-center">
              <h2 className="rbt-title mb--8">
                <span className="rbt-text-bold">
                  Wishlist
                </span>
              </h2>
            </div>
          </div>
          {isCatalogLoading ? (
            <div className="col-12 text-center">
              <p>{t("common.loading")}</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="col-12 text-center">
              <p className="rbt-title rbt-text-bold h6">{t("wishlist.empty")}</p>
              <p>{t("wishlist.emptyHint")}</p>
              <Link href="/" className="rbt-btn rbt-btn-md mt--16">
                <span className="btn-text">{t("common.continueShopping")}</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="col-12 col-lg-10 mx-auto">
                <div className="rbt-transparent-table-one-wrapper rbt-has-bg-gray pt--0 pb--0 mb--20 rbt-scrollable-content">
                  <table className="rbt-transparent-table-one rbt-wishlist-table mb--0">
                    <tbody>
                      {entries.map(({ item, product, variant }) => (
                        <tr key={`${item.productId}-${item.variantId ?? "default"}`}>
                          <td className="rbt-product-remove-btn-wrapper">
                            <button
                              className="rbt-product-remove-btn rbt-round-btn tooltips"
                              type="button"
                              data-tooltip="Remove"
                              onClick={() => removeFromWishlist(item)}
                            >
                              <span>
                                <i className="fa-solid fa-xmark" />
                              </span>
                            </button>
                          </td>
                          <td className="product-thumbnail">
                            <Link href={`/product/${product.slug}`}>
                              <Image
                                src={variant.images?.[0] ?? product.images[0]}
                                alt={product.name}
                                width={140}
                                height={107}
                              />
                            </Link>
                          </td>
                          <td className="rbt-wish-product-info">
                            <h2 className="rbt-wish-product-name h6">
                              <Link href={`/product/${product.slug}`}>
                                {product.name}
                              </Link>
                            </h2>
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
                          <td className="rbt-product-stock-status">
                            <div
                              className={`rbt-product-badge border-rounded ${variant.stock > 0 ? "rbt-product-badge-bg-light-green" : "rbt-product-badge-bg-danger"}`}
                            >
                              {(variant.stock > 0 ? t("common.inStock") : t("common.outOfStock")).toUpperCase()}
                            </div>
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
              </div>
              {/* Start wishlist bottom area */}
              <div className="col-12 col-lg-10 mx-auto">
                <div className="rbt-wishlist-bottom-area">
                  <div className="rbt-social-share-area">
                    <p className="title mb--0 mr--24 mr_sm--0">
                      Share on :
                    </p>
                    <ul className="rbt-social-icon-list">
                      <li>
                        <a href="#">
                          <i className="fa-brands fa-x-twitter" />
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fa-brands fa-youtube" />
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fa-brands fa-facebook" />
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fa-brands fa-whatsapp" />
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fa-brands fa-instagram" />
                        </a>
                      </li>
                      <li>
                        <a href="#">
                          <i className="fa-brands fa-telegram" />
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              {/* End wishlist bottom area */}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
