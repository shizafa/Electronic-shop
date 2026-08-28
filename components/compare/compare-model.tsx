"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { useCompare } from "@/context/compare-context";
import { getCategoryById } from "@/lib/categories";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import { getDisplayVariant } from "@/lib/product-helpers";
import { getProductById } from "@/lib/products";
import { buildSpecRows, formatSpecValue, type SpecRow } from "@/lib/specs";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

// Matches lib/compare.ts's own MAX_COMPARE_ITEMS (not exported — lib/** is off-limits to edit
// per project rules) and the template's fixed 4-column table.
const COMPARE_SLOT_COUNT = 4;

// Compare quick-view modal, opened by the header's compare icon (sticky-header-compare-link.tsx)
// via CompareContext's isCompareModalOpen. Same Bootstrap-modal-without-Bootstrap-JS rebuild as
// wishlist-model.tsx: "show" class + inline display, a manually-rendered .modal-backdrop,
// backdrop click and Escape both close it.
//
// Resolves compared products itself (per-id lookups, same pattern as cart-side-nav.tsx) rather
// than useProductCatalog — this modal mounts on every storefront page via app/(site)/layout.tsx,
// and useProductCatalog fetches the *whole* catalog, which product-catalog-context.tsx
// deliberately keeps scoped to cart/wishlist/compare/checkout only. Spec rows reuse
// lib/specs.ts's buildSpecRows — the same function the existing /compare page (compare-view.tsx)
// uses — rather than the pasted markup's fixed demo rows (Sold By/Color/Fit Type/Item
// Dimensions), since those don't correspond to real fields on Product and vary by category.
// Customer Rating renders neutral (empty stars, (0)) rather than the demo's 5-star/(46) — same
// treatment product-card.tsx already gives this exact gap, since Product has no rating field yet.
export function CompareModal() {
  const { items, isCompareModalOpen, closeCompareModal, removeFromCompare } = useCompare();
  const { addToCart } = useCart();
  const [productsById, setProductsById] = useState<Record<string, Product | null>>({});
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    const missingIds = items.map((item) => item.productId).filter((id) => !(id in productsById));
    if (missingIds.length === 0) return;

    let active = true;
    Promise.all(missingIds.map((id) => getProductById(id))).then((products) => {
      if (!active) return;
      setProductsById((current) => {
        const next = { ...current };
        products.forEach((product, index) => {
          next[missingIds[index]] = product ?? null;
        });
        return next;
      });
    });

    return () => {
      active = false;
    };
  }, [items, productsById]);

  const categoryId = items[0]?.categoryId;
  useEffect(() => {
    if (!categoryId) return;
    let active = true;
    getCategoryById(categoryId).then((result) => {
      if (active) setCategory(result ?? null);
    });
    return () => {
      active = false;
    };
  }, [categoryId]);

  useEffect(() => {
    if (!isCompareModalOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeCompareModal();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCompareModalOpen, closeCompareModal]);

  // drop any compared item whose product no longer exists in the catalog, or has no variants
  const products = items
    .map((item) => productsById[item.productId])
    .filter((product): product is Product => !!product)
    .filter((product) => product.variants.length > 0);

  const isResolving = items.some((item) => !(item.productId in productsById));

  // Non-null: every product here was just filtered to have at least one variant
  const entries = products.map((product) => ({ product, variant: getDisplayVariant(product)! }));

  const introRows: SpecRow[] = [
    { id: "price", label: t("product.price"), values: entries.map(({ variant }) => formatPrice(variant.price)) },
    { id: "brand", label: t("product.brand"), values: entries.map(({ product }) => product.brand) },
  ];
  const specRows = buildSpecRows(entries, category ?? undefined);
  const featureRows = [...introRows, ...specRows];

  const slots = Array.from({ length: COMPARE_SLOT_COUNT }, (_, index) => entries[index] ?? null);

  return (
    <>
      {isCompareModalOpen && <div className="modal-backdrop fade show" onClick={closeCompareModal} />}
      <div
        className={`rbt-default-modal modal fade  has-rbt-top-folder-shape${isCompareModalOpen ? " show" : ""}`}
        id="compareviewModal"
        style={{ display: isCompareModalOpen ? "block" : "none" }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="compareviewModalLabel"
        aria-hidden={!isCompareModalOpen}
      >
        <div className="modal-dialog modal-dialog-centered xl-size">
          <div className="modal-content">
            <div className="rbt-folder-shape-right-portion">
              <svg xmlns="http://www.w3.org/2000/svg" width="85" height="90" viewBox="0 0 85 90" fill="none">
                <path d="M0 0H11.1844C14.5695 0 17.7971 1.42971 20.0716 3.93671L82.1927 72.4059C83.9992 74.397 84.9999 76.9893 84.9999 79.6778C84.9999 85.6547 85.0001 90 85.0001 90H0V0Z" fill="white" />
              </svg>
            </div>
            <div className="modal-header">
              <button type="button" className="rbt-round-btn rbt-modal-dis-btn" onClick={closeCompareModal} aria-label="Close">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
            <div className="rbt-top-folder-shape-wrapper">
              {/* Start Componente Area */}
              <div className="rbt-component-area rbt-compare-table-area rbt-content-trs-portion">
                <div className="row">
                  <div className="col-12">
                    <div className="rbt-component-section-title rbt-gap--4 mb--24 p-0 border-0 text-left">
                      <div id="compareviewModalLabel" className="rbt-title mb--0">
                        <span className="rbt-text-bold h4">
                          Compare Product
                        </span>
                      </div>
                    </div>
                  </div>
                  {isResolving ? (
                    <div className="col-12">
                      <p>{t("common.loading")}</p>
                    </div>
                  ) : entries.length === 0 ? (
                    <div className="col-12">
                      <p>{t("compare.empty")}</p>
                      <p>{t("compare.emptyHint")}</p>
                    </div>
                  ) : (
                    <div className="col-12 rbt-scrollable-content">
                      {/* Start Compare Table */}
                      <table className="rbt-compare-table">
                        <tbody>
                          <tr>
                            <td />
                            {slots.map((entry, index) => (
                              <td key={entry ? entry.product.id : `empty-search-${index}`}>
                                {!entry && (
                                  <div className="rbt-input-field-grp">
                                    <input className="rbt-input-field" type="text" placeholder="Search and Select Product" disabled />
                                    <button className="rbt-search-btn" type="button" disabled>
                                      <i className="fa-sharp fa-solid fa-magnifying-glass" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            ))}
                          </tr>
                          <tr className="rbt-compare-prd-table-head">
                            <td className="rbt-compare-table-title">
                              <div className="rbt-compare-values">
                                <span>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56" fill="none">
                                    <path d="M28 7.5C25.0767 7.5 22.6975 9.88262 22.6975 12.8112C22.6936 13.7244 22.9272 14.6229 23.3755 15.4184C23.8237 16.214 24.4712 16.8793 25.2543 17.349C26.0823 17.8506 27.0319 18.1157 28 18.1157C28.9681 18.1157 29.9177 17.8506 30.7458 17.349C31.5289 16.8794 32.1764 16.2141 32.6247 15.4185C33.073 14.6229 33.3066 13.7244 33.3025 12.8112C33.3025 9.88262 30.9234 7.5 28 7.5ZM35.1392 42.6269H31.1667L31.1675 42.6225V19.1112C30.1963 19.61 29.1025 19.8638 28 19.8638C26.8975 19.8638 25.8038 19.61 24.8325 19.1112V42.6225L24.8334 42.6269H20.8609C19.8457 42.628 18.8723 43.0318 18.1544 43.7496C17.4364 44.4674 17.0324 45.4406 17.031 46.4559V47.6258C17.031 47.8578 17.1232 48.0804 17.2873 48.2445C17.4514 48.4086 17.674 48.5008 17.906 48.5008H38.094C38.3261 48.5008 38.5487 48.4086 38.7127 48.2445C38.8768 48.0804 38.969 47.8578 38.969 47.6258V46.4559C38.9676 45.4406 38.5637 44.4674 37.8457 43.7496C37.1277 43.0318 36.1544 42.628 35.1392 42.6269ZM12.2439 33.8524C15.9495 33.8524 18.9657 30.8371 18.9657 27.1306C18.9657 26.8629 18.9989 25.8575 18.8922 25.6134L18.8904 25.6055L13.5914 13.6871H21C20.9292 13.1059 20.9292 12.5183 21 11.9371H12.2395C12.0724 11.9416 11.9097 11.9922 11.7695 12.0833C11.6293 12.1744 11.517 12.3025 11.445 12.4534L5.60003 25.6037L5.59915 25.6064C5.4889 25.854 5.52128 26.8506 5.52128 27.1297C5.52215 30.8363 8.5374 33.8524 12.2439 33.8524ZM12.243 14.9611L16.744 25.0849H7.73853L12.243 14.9611ZM50.477 25.9529C50.4762 25.9161 50.4604 25.8803 50.4552 25.8435C50.4438 25.7612 50.4333 25.6799 50.4009 25.6064L50.4 25.6037L44.555 12.4525C44.4837 12.3013 44.3716 12.1729 44.2315 12.0818C44.0913 11.9906 43.9286 11.9402 43.7614 11.9362H35C35.0709 12.5174 35.0709 13.1051 35 13.6862H42.4086L37.1097 25.6046L37.1079 25.6125C37.086 25.6633 37.0834 25.7219 37.0712 25.777C37.0589 25.8356 37.0362 25.8934 37.0362 25.952L37.0344 25.959V27.1289C37.0344 30.8354 40.0497 33.8506 43.757 33.8506C47.4627 33.8506 50.4788 30.8354 50.4788 27.1289V25.959L50.477 25.9529ZM39.256 25.0849L43.757 14.9611L48.2615 25.0849H39.256Z" fill="#E6E6E6" />
                                  </svg>
                                </span>
                                <p className="rbt-compare-table-text">
                                  Find and select products to see the differences and similarities between them
                                </p>
                              </div>
                            </td>
                            {slots.map((entry, index) => (
                              <td key={entry ? entry.product.id : `empty-product-${index}`}>
                                {entry && (
                                  <div className="rbt-compare-item-wrapper">
                                    <button
                                      className="rbt-product-remove-btn"
                                      type="button"
                                      onClick={() => removeFromCompare(entry.product.id)}
                                    >
                                      <i className="fa-sharp fa-solid fa-xmark" />
                                    </button>
                                    <Link
                                      href={`/product/${entry.product.slug}`}
                                      className="rbt-product-item-img rbt-bg-color-brand-100 rbt-scroll-trigger fade_in animation-order-1"
                                      onClick={closeCompareModal}
                                    >
                                      <Image
                                        src={entry.variant.images?.[0] ?? entry.product.images[0]}
                                        alt={entry.product.name}
                                        width={224}
                                        height={224}
                                      />
                                    </Link>
                                    <div className="rbt-compare-values">
                                      {category && (
                                        <Link
                                          href={`/category/${category.slug}`}
                                          className="rbt-product-item-category"
                                          onClick={closeCompareModal}
                                        >
                                          {category.name}
                                        </Link>
                                      )}
                                      <p className="rbt-product-item-title h6">
                                        <Link href={`/product/${entry.product.slug}`} onClick={closeCompareModal}>
                                          {entry.product.name}
                                        </Link>
                                      </p>
                                      <button
                                        type="button"
                                        className="rbt-btn rbt-btn-sm has-left-icon"
                                        disabled={entry.variant.stock === 0}
                                        onClick={() => addToCart(entry.product.id, entry.variant.id, 1)}
                                      >
                                        <i className="fa-regular fa-cart-shopping" />
                                        Add To Cart
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="rbt-product-feature-name">
                              Customer Rating
                            </td>
                            {slots.map((entry, index) => (
                              <td key={entry ? entry.product.id : `empty-rating-${index}`}>
                                {entry && (
                                  <div className="rbt-compare-values">
                                    <div className="rbt-card-rating">
                                      <ul className="rbt-rating-icon-list">
                                        {Array.from({ length: 5 }).map((_, starIndex) => (
                                          <li key={starIndex}>
                                            <i className="fa-regular fa-star" />
                                          </li>
                                        ))}
                                      </ul>
                                      <p className="rating-digit">
                                        (0)
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </td>
                            ))}
                          </tr>
                          {featureRows.map((row) => (
                            <tr key={row.id}>
                              <td className="rbt-product-feature-name">
                                {row.label}
                              </td>
                              {slots.map((entry, index) => (
                                <td key={entry ? entry.product.id : `empty-${row.id}-${index}`}>
                                  {entry && (
                                    <div className="rbt-compare-values">
                                      {row.id === "price" ? (
                                        <span className="rbt-product-price">
                                          {row.values[index]}
                                        </span>
                                      ) : (
                                        formatSpecValue(row.values[index])
                                      )}
                                    </div>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {/* End Compare Table */}
                    </div>
                  )}
                </div>
              </div>
              {/* End Componente Area */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
