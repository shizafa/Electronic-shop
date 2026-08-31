import Link from "next/link";
import { getVisibleCategories } from "@/lib/categories";
import { resolveBrandLogo } from "@/lib/brand-logo";
import { getAllProducts } from "@/lib/products";
import { t } from "@/lib/i18n";

// One category per column, always in a single row (never wrapping a category under another
// one's column) — bootstrap's standard col-xl-2/3/4/6/12 activate at min-width:1200px, the
// same breakpoint as this row's outer col-xl-9/col-xl-3 split (nav-menu.tsx below). But
// style.min.css's own "fifths" grid (its .col-xl-1-5 etc) is scoped to min-width:1400px, not
// 1200 — using it here left the outer split active with the 5-category row still stacked
// full-width from 1200-1400px (and at any zoom level that puts the viewport in that range),
// breaking the megamenu. col-lg-1-5 is the same 20%-width rule but scoped to min-width:992px,
// so it's already active by the time the outer col-xl-9 split kicks in at 1200 — same fifths
// grid used elsewhere for 5-across layout (components/home/brand-logos.tsx). 6+ falls back to
// six-per-row and wraps.
function megaMenuColumnClass(categoryCount: number): string {
  if (categoryCount <= 1) return "col-xl-12";
  if (categoryCount === 2) return "col-xl-6";
  if (categoryCount === 3) return "col-xl-4";
  if (categoryCount === 4) return "col-xl-3";
  if (categoryCount === 5) return "col-lg-1-5";
  return "col-xl-2";
}

// Unbacked promo content from the megamenu pattern (mega-menue.tsx) — no campaign/banner
// data model exists, so this is kept verbatim rather than deleted, per "match the template
// exactly, don't delete markup." promoImage originally pointed at the template's own file
// (assets/images/splash/menu-banner/menu-prd-03-lg.webp), which was never pasted into
// public/ and 404s — swapped for the decorative asset actually uploaded for this card.
// TODO: wire to backend
const PLACEHOLDER = {
  promoTitle: "New Aurora Watch",
  promoDesc: "Send your idea, appear Unimart.",
  promoHref: "/shop",
  promoImage: "/assets/images/promo-banner.webp",
};

// The reusable nav content: <nav class="rbt-mainmenu-nav"><ul class="mainmenu">...</ul></nav>.
// Rendered by both the normal nav bar and the sticky clone (its markup literally says
// "nav reused — you have this already" at that spot) — built once here, per that decision,
// rather than porting the ~1600-line template nav twice.
//
// Server component, no useState: desktop dropdowns/megamenu are pure CSS
// (li.has-dropdown:hover > .submenu, li.with-rbt-megamenu:hover .rbt-megamenu — both
// confirmed in style.min.css), so there's nothing here that needs to run in the browser.
//
// getVisibleCategories/getAllProducts are wrapped in React's cache() in lib/, so calling
// them again from the sticky clone within the same request request-dedupes rather than
// re-querying Supabase.
export async function NavMenu() {
  const [categories, products] = await Promise.all([getVisibleCategories(), getAllProducts()]);

  const topProductsByCategory = categories.map((category) => {
    const inCategory = products.filter((product) => product.categoryId === category.id);
    const featuredFirst = [...inCategory].sort((a, b) => Number(b.featured) - Number(a.featured));
    return { category, topProducts: featuredFirst.slice(0, 4) };
  });

  // Megamenu brand strip: real brands from the catalog (most products first), logo-only —
  // same source as the homepage BrandLogos section, just brands with no uploaded logo file
  // are skipped here instead of rendering a blank slot.
  const brandCounts = new Map<string, number>();
  for (const product of products) {
    brandCounts.set(product.brand, (brandCounts.get(product.brand) ?? 0) + 1);
  }
  const menuBrands = Array.from(brandCounts.keys())
    .sort((a, b) => (brandCounts.get(b) ?? 0) - (brandCounts.get(a) ?? 0))
    .map((brand) => ({ brand, logo: resolveBrandLogo(brand) }))
    .filter((entry): entry is { brand: string; logo: string } => Boolean(entry.logo));

  return (
    <nav className="rbt-mainmenu-nav">
      {/* has-nav-bg-shape-hover: style.min.css's translucent-white (rgba(255,255,255,.15))
          pill-behind-the-link hover/active effect, scoped to .rbt-bg-color-primary bars
          (nav-bar.tsx) — pairs with that class's white link color. */}
      <ul className="mainmenu has-nav-bg-shape-hover">
        <li className="with-rbt-megamenu has-menu-child-item position-static">
          <a href="#!">
            {t("nav.shop")}
            <i className="fa-regular fa-chevron-down" />
          </a>
          {/* Start Mega Menu */}
          {/* rbt-width-fullscreen (real style.min.css class:
              .rbt-megamenu.rbt-width-fullscreen{width:100%;margin:0;padding:0}) replaces the
              bootstrap .container that was capping this at the page container's max-width —
              paired with the li's existing position-static, the megamenu's position:absolute
              left:0/right:0 then resolves against .rbt-header-middle (position:relative,
              full-bleed) instead of the small <li>, giving true edge-to-edge width. */}
          <div className="rbt-megamenu rbt-width-fullscreen">
            <div className="rbt-megamenu-wrapper">
              <div className="row row--12 d-flex justify-content-between">
                <div className="col-xl-9">
                  <div className="h-100 d-flex flex-column justify-content-between">
                    <div className="row row--12">
                      {topProductsByCategory.map(({ category, topProducts }, index) => (
                        <div key={category.id} className={`${megaMenuColumnClass(topProductsByCategory.length)} single-mega-item rbt-scroll-trigger fade_in animation-order-${index + 1}`}>
                          <p className="rbt-short-title h5">
                            <Link href={`/category/${category.slug}`}>
                              {category.name}
                            </Link>
                          </p>
                          <ul className="mega-menu-item">
                            {topProducts.map((product) => (
                              <li key={product.id}>
                                <Link href={`/product/${product.slug}`}>
                                  {product.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    {/* rbt-btn/rbt-btn-sm: same button classes as the promo card's "View
                        Details" link to its right, so this reads as one consistent button
                        style. justify-content-between on this column's flex-column parent
                        pushes it to the bottom, level with the promo card beside it.
                        align-self-start (bootstrap) stops that same flex-column parent from
                        stretching the link to the column's full width. rbt-see-all-products-
                        btn: site-overrides.css shrinks rbt-btn-sm's default padding:0
                        32px/height:36px down to hug the text. */}
                    <Link className="rbt-btn rbt-btn-sm rbt-see-all-products-btn align-self-start ml--20" href="/shop">
                      See All Our Products
                    </Link>
                  </div>
                </div>
                <div className="col-xl-3 single-mega-item rbt-scroll-trigger fade_in animation-order-1">
                  <div className="rbt-menu-offer-card rbt-bg-style-box rbt-bg-two">
                    <div className="mega-top-banner">
                      <div className="rbt-banner-inner flex-column justify-content-center rbt-gap--8 align-items-center text-center">
                        <div className="rbt-banner-content">
                          <h2 className="title rbt-text-color-white">
                            {PLACEHOLDER.promoTitle}
                          </h2>
                          <p className="b3 desc rbt-text-color-gray-200">
                            {PLACEHOLDER.promoDesc}
                          </p>
                        </div>
                        <Link className="rbt-btn rbt-btn-sm" href={PLACEHOLDER.promoHref}>
                          View Details
                        </Link>
                        <Link href={PLACEHOLDER.promoHref} className="product-img position-bottom mt--24">
                          <img src={PLACEHOLDER.promoImage} alt="Eccommerce Product" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Brand strip: real catalog brands (lib/brand-logo.ts), full megamenu width —
                  mirrors the "brand-strip row" the template ships below the same two-column
                  layout (mega-menue.tsx pattern), left unbuilt until now for lack of a brand
                  data source; rbt-nav-brand-list is style.min.css's own nav-brand-row class. */}
              {menuBrands.length > 0 && (
                <div className="row row--12 rbt-border-top mt--20 pt--20">
                  <div className="col-lg-12">
                    <ul className="rbt-nav-brand-list d-flex align-items-center justify-content-start flex-wrap">
                      {menuBrands.map(({ brand, logo }) => (
                        <li key={brand}>
                          <Link href={`/search?q=${encodeURIComponent(brand)}`}>
                            <img src={logo} alt={brand} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* End Mega Menu */}
        </li>
        {/* Flat top-level links: no has-dropdown/.submenu pattern has been provided yet, so
            these are plain <li><Link> items rather than an invented dropdown. The old
            moreLinks (FAQs, shipping, returns, privacy, terms) are policy links meant for a
            "More" dropdown, not top-level items — left out until that pattern exists rather
            than dumping them in flat. */}
        <li>
          <Link href="/about">
            {t("nav.aboutUs")}
          </Link>
        </li>
        <li>
          <Link href="/contact">
            {t("nav.contactUs")}
          </Link>
        </li>
        <li>
          <Link href="/deals">
            {t("nav.deals")}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
