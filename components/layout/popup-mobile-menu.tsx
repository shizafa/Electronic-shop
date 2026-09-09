"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type MouseEvent } from "react";
import { useCompare } from "@/context/compare-context";
import { useMobileMenu } from "@/context/mobile-menu-context";
import { useWishlist } from "@/context/wishlist-context";
import { t } from "@/lib/i18n";
import type { Category } from "@/types/category";

type MobileMenuTab = "menu" | "categories";

interface PopupMobileMenuProps {
  categories: Category[];
  logoUrl: string | null;
  storeName: string;
}

// Mobile off-canvas menu (<1200px, style.min.css hides .popup-mobile-menu entirely above
// that), opened by the hamberger-button in main-bar.tsx/sticky-header.tsx via
// MobileMenuContext. Ported from the template's popup-mobile-menu markup, with its two
// Bootstrap-JS-driven interactions rebuilt as React state instead (no Bootstrap JS/jQuery
// loaded, per project rules):
//   - the Menu/Categories tabs (was data-bs-toggle="tab") -> activeTab state, toggling the
//     same "show active" classes bootstrap.min.css's .tab-content>.active{display:block} and
//     .fade:not(.show){opacity:0} already key off
//   - the Shop item's expand/collapse (was the template's own untouched menu.js) -> isShopOpen
//     state; style.min.css's .has-dropdown>a.open::after swaps the +/x icon, but never
//     actually shows the submenu on its own (no ".open ~ .submenu{display:block}" rule exists),
//     so the submenu's display is driven directly by isShopOpen here.
//
// The template's own "Menu" tab content (Part B/C of the pasted markup) is generic demo copy
// - a "Home" item mega-menu of demo pages, and a "More" dropdown linking to rainbowthemes.net
// docs/support - neither corresponds to anything in this app, so it's replaced with this
// site's real top-level nav (Shop/About/Contact Us/Present Deals, same links as nav-menu.tsx)
// rather than porting placeholder content. Shop expands to the real category list instead of
// re-porting nav-menu.tsx's desktop megamenu (top products + promo banner + brand strip) as a
// touch accordion - style.min.css already has a simpler, ready-made pattern for exactly this
// shape (.has-dropdown > .submenu, a plain link list), and re-flowing the desktop megamenu's
// hover-only markup for click-to-expand use would mean redesigning it, not just reusing it.
//
// Likewise the template's "Categories" tab (Part E) demos one category with a full nested
// mega-grid (subcategories + promo card) - there's no subcategory data behind any real
// category here, so every category renders with the flat single-link pattern the template
// itself uses for its other, non-demoed categories (Part F) instead of inventing subcategories
// to fill that richer layout.
export function PopupMobileMenu({ categories, logoUrl, storeName }: PopupMobileMenuProps) {
  const { isMobileMenuOpen, closeMobileMenu } = useMobileMenu();
  const { items: wishlistItems, openWishlistModal } = useWishlist();
  const { items: compareItems, openCompareModal } = useCompare();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MobileMenuTab>("menu");
  const [isShopOpen, setIsShopOpen] = useState(false);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    if (!query) return;
    closeMobileMenu();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  // The backdrop itself closes the menu on click; .inner-wrapper stops that click from
  // bubbling up so interacting with the panel doesn't also close it.
  function stopClosePropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  return (
    <div className={`popup-mobile-menu${isMobileMenuOpen ? " active" : ""}`} onClick={closeMobileMenu}>
      <div className="inner-wrapper" onClick={stopClosePropagation}>
        <div className="mobile-menu-top">
          <div className="inner-top">
            <div className="content">
              <div className="logo">
                <Link href="/" onClick={closeMobileMenu}>
                  {logoUrl ? <img src={logoUrl} alt={storeName} /> : storeName}
                </Link>
              </div>
              <div className="rbt-btn-close">
                <button className="close-button rbt-round-btn" type="button" onClick={closeMobileMenu}>
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>
            </div>
            <p className="description">
              {t("footer.tagline")}
            </p>
            <form
              className="rbt-inner-search-field style-one rbt-search-field-rounded rbt-search-field-sm-width"
              onSubmit={handleSearchSubmit}
            >
              <input type="text" name="q" placeholder={t("nav.searchPlaceholder")} />
              <button className="rbt-round-btn search-btn rbt-text-color-gray-500" type="submit" aria-label={t("nav.search")}>
                <i className="fa-solid fa-magnifying-glass" />
              </button>
            </form>
          </div>
          <div className="rbt-tab rbt-round-shape-tab">
            <ul className="nav nav-tabs mb--0" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link${activeTab === "menu" ? " active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "menu"}
                  onClick={() => setActiveTab("menu")}
                >
                  <i className="fa-solid fa-bars-sort" />
                  {t("nav.menu")}
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link${activeTab === "categories" ? " active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "categories"}
                  onClick={() => setActiveTab("categories")}
                >
                  <i className="fa-sharp fa-regular fa-layer-group" />
                  {t("nav.categories")}
                </button>
              </li>
            </ul>
            <div className="tab-content">
              <div className={`tab-pane fade${activeTab === "menu" ? " show active" : ""}`} role="tabpanel">
                <nav className="rbt-mainmenu-nav">
                  <ul className="mainmenu">
                    <li className="has-dropdown position-relative">
                      <a
                        href="#!"
                        className={isShopOpen ? "open" : undefined}
                        onClick={(event) => {
                          event.preventDefault();
                          setIsShopOpen((current) => !current);
                        }}
                      >
                        {t("nav.shop")}
                      </a>
                      <ul className="submenu" style={{ display: isShopOpen ? "block" : "none" }}>
                        {categories.map((category) => (
                          <li key={category.id}>
                            <Link href={`/category/${category.slug}`} onClick={closeMobileMenu}>
                              {category.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                    <li>
                      <Link href="/about" onClick={closeMobileMenu}>
                        {t("nav.aboutUs")}
                      </Link>
                    </li>
                    <li>
                      <Link href="/contact" onClick={closeMobileMenu}>
                        {t("nav.contactUs")}
                      </Link>
                    </li>
                    <li>
                      <Link href="/deals" onClick={closeMobileMenu}>
                        {t("nav.deals")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/wishlist"
                        onClick={(event) => {
                          event.preventDefault();
                          closeMobileMenu();
                          openWishlistModal();
                        }}
                      >
                        {t("account.wishlist")}
                        {wishlistItems.length > 0 && (
                          <span className="badge bg-primary rounded-pill ms-2">{wishlistItems.length}</span>
                        )}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/compare"
                        onClick={(event) => {
                          event.preventDefault();
                          closeMobileMenu();
                          openCompareModal();
                        }}
                      >
                        Compare
                        {compareItems.length > 0 && (
                          <span className="badge bg-primary rounded-pill ms-2">{compareItems.length}</span>
                        )}
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
              <div className={`tab-pane fade${activeTab === "categories" ? " show active" : ""}`} role="tabpanel">
                <nav className="rbt-mainmenu-nav">
                  <ul className="mainmenu">
                    {categories.map((category) => (
                      <li key={category.id}>
                        <Link href={`/category/${category.slug}`} onClick={closeMobileMenu}>
                          {category.name}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link href="/shop" onClick={closeMobileMenu}>
                        {t("nav.viewAllCategories")}
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
