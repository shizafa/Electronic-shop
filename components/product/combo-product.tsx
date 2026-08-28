"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { formatPrice } from "@/lib/currency";
import { getDisplayVariant } from "@/lib/product-helpers";
import type { Product } from "@/types/product";

const IMAGE_WIDTH = 435;
const IMAGE_HEIGHT = 341;
const IMAGE_RATIO = { aspectRatio: `${IMAGE_WIDTH} / ${IMAGE_HEIGHT}` };
const MAX_BUNDLE_ITEMS = 3;

interface ComboProductProps {
  relatedProducts: Product[];
}

// "Frequently bought together" bundle widget. No bundle/combo data model exists anywhere in
// this app, so this reuses up to 3 same-category relatedProducts as a stand-in bundle. The
// template's per-item Size dropdown is dropped — it's generic apparel sizing that doesn't map
// to this store's actual variant axes (screen size, tonnage, storage, ...), and different
// bundled products would have different axes anyway.
//
// The template drives the checked-state visuals (the checkmark drawn on .rbt-img) via a
// .selected class rather than :checked, confirmed in style.min.css
// (".rbt-img.selected::before/::after"), so that class is toggled here from the same React
// state that drives the running total.
export function ComboProduct({ relatedProducts }: ComboProductProps) {
  // Excludes products with no variants at all up front, so every getDisplayVariant(item) call
  // below is guaranteed to resolve — nothing sellable to bundle otherwise.
  const bundleItems = relatedProducts.filter((product) => product.variants.length > 0).slice(0, MAX_BUNDLE_ITEMS);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => new Set(bundleItems.map((item) => item.id)));
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  if (bundleItems.length < 2) return null;

  function toggleItem(id: string) {
    setCheckedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const checkedItems = bundleItems.filter((item) => checkedIds.has(item.id));
  // Non-null: every item here came from bundleItems, already filtered to products with variants.
  const total = checkedItems.reduce((sum, item) => sum + getDisplayVariant(item)!.price, 0);

  function handleAddAllToCart() {
    checkedItems.forEach((item) => addToCart(item.id, getDisplayVariant(item)!.id, 1));
  }

  function handleAddAllToWishlist() {
    checkedItems.forEach((item) => addToWishlist({ productId: item.id, variantId: getDisplayVariant(item)!.id }));
  }

  return (
    <div className="rbt-component-area rbt-section-gap rbt-bg-color-gray-light">
      <div className="container">
        <div className="rbt-combo-prd-box rbt-bg-color-white">
          <div className="row justify-content-between">
            <div className="col-lg-2">
              <div className="rbt-combo-title-section">
                <i className="fa-regular fa-cube" />
                <h2 className="rbt-title h5">
                  There&apos;s more in the complete bundle
                </h2>
              </div>
            </div>
            <div className="col-lg-10">
              <div className="rbt-combo-prd-content-section">
                <div className="rbt-prd-pricing-box rbt-bg-color-white">
                  <div className="rbt-pricing-box-top">
                    <div className="rbt-prd-img-area">
                      {bundleItems.map((item) => (
                        <div className="single-product-img-box" key={item.id}>
                          <span className="icon h6">
                            <i className="fa-solid fa-plus" />
                          </span>
                          <label className={`rbt-img${checkedIds.has(item.id) ? " selected" : ""}`} htmlFor={`rbt-cmb-${item.id}`}>
                            <Image
                              src={item.images[0]}
                              alt={item.name}
                              width={IMAGE_WIDTH}
                              height={IMAGE_HEIGHT}
                              style={IMAGE_RATIO}
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="rbt-pricing-area">
                      <div className="price d-flex align-items-center justify-content-center rbt-gap--4">
                        <p className="mb--0 h6">
                          Total:
                        </p>
                        <p className="mb--0 rbt-text-bold h4">
                          {formatPrice(total)}
                        </p>
                      </div>
                      <div className="rbt-button-group mt--16 text-center mt_sm--8">
                        <button
                          className="rbt-btn rbt-btn-md"
                          type="button"
                          disabled={checkedItems.length === 0}
                          onClick={handleAddAllToCart}
                        >
                          <i className="fa-regular fa-cart-shopping mr--4" />
                          Add To Cart All
                        </button>
                        <button
                          className="rbt-btn rbt-btn-md rbt-btn-border"
                          type="button"
                          disabled={checkedItems.length === 0}
                          onClick={handleAddAllToWishlist}
                        >
                          Add All To Wishlist
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="rbt-pricing-box-bottom">
                    <ul className="rbt-combo-prd-list  liststyle">
                      {bundleItems.map((item) => {
                        const { price, compareAtPrice } = getDisplayVariant(item)!;
                        return (
                          <li className="rbt-single-prd" key={item.id}>
                            <div className="input-part">
                              <input
                                id={`rbt-cmb-${item.id}`}
                                className="rbt-check-green"
                                type="checkbox"
                                name={`rbt-cmb-${item.id}`}
                                checked={checkedIds.has(item.id)}
                                onChange={() => toggleItem(item.id)}
                              />
                              <label htmlFor={`rbt-cmb-${item.id}`}>
                                {item.name}
                              </label>
                            </div>
                            <div className="pricing-part mt--0">
                              {compareAtPrice !== undefined && (
                                <del className="price-text">
                                  {formatPrice(compareAtPrice)}
                                </del>
                              )}
                              <span className="price-text">
                                {formatPrice(price)}
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
