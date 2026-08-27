import Link from "next/link";
import { getVisibleCategories } from "@/lib/categories";
import { getAllProducts } from "@/lib/products";
import { t } from "@/lib/i18n";

// Unbacked promo content from the megamenu pattern (mega-menue.tsx) — no campaign/banner
// data model exists, so this is kept verbatim rather than deleted, per "match the template
// exactly, don't delete markup."
// TODO: wire to backend
const PLACEHOLDER = {
  promoTitle: "New Aurora Watch",
  promoDesc: "Send your idea, appear Unimart.",
  promoHref: "/shop",
  promoImage: "/assets/images/splash/menu-banner/menu-prd-03-lg.webp",
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
          <div className="rbt-megamenu container pl_sm--0 pl_md--0 pl_lg--0">
            <div className="rbt-megamenu-wrapper">
              <div className="row row--12 d-flex justify-content-between">
                <div className="col-xl-9">
                  <div className="h-100 d-flex flex-column justify-content-between">
                    <div className="row row--12">
                      {/* Pattern only covers up to 4 columns (mega-menue.tsx: 1 given +
                          "3 more .col-xl-3 columns here" comment). categories.length is 3
                          today, so this fits — but there's no wrapping pattern for a 5th+
                          category once one gets added. */}
                      {topProductsByCategory.map(({ category, topProducts }, index) => (
                        <div key={category.id} className={`col-xl-3 single-mega-item rbt-scroll-trigger fade_in animation-order-${index + 1}`}>
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
