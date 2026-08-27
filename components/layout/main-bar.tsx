import Link from "next/link";
import { MainBarAccountLink } from "@/components/layout/main-bar-account-link";
import { MainBarCartLink } from "@/components/layout/main-bar-cart-link";
import { MainBarSearch } from "@/components/layout/main-bar-search";
import { getVisibleCategories } from "@/lib/categories";
import { t } from "@/lib/i18n";

// Real store phone number, shared with /contact and the old header.tsx it replaces.
// TODO: wire to backend
const PLACEHOLDER = {
  phone: "021-111-000-000",
  phoneHref: "tel:021111000000",
};

// Main header bar: logo, category-filtered search, and the right-hand quick-access icons
// (hotline, account, mobile search trigger, mini-cart).
//
// Server component apart from three leaves (MainBarSearch, MainBarAccountLink,
// MainBarCartLink) that need client hooks — categories are fetched here and handed down as
// plain data rather than re-fetched client-side.
//
// Two triggers are left inert on purpose, matching the build order (topbar -> main bar ->
// nav shell -> nav data -> sticky -> search dropdown -> mobile menu -> cart drawer):
//   - .hamberger-button (mobile-menu-bar): wired in the "mobile menu" step
//   - .rbt-cat-offcanvas-activation: a category off-canvas panel not in the build order at all
//   - .search-trigger-active (mobile search icon): wired in the "search dropdown" step
export async function MainBar() {
  const categories = await getVisibleCategories();

  return (
    <div className="rbt-wrapper-middle rbt-header-middle-one">
      <div className="container">
        <div className="mainbar-row @@navigationEnd align-items-center">
          <div className="header-left">
            <div className="mobile-menu-bar d-block d-xl-none">
              <div className="hamberger">
                <button className="hamberger-button rbt-round-btn" type="button" aria-label={t("nav.menu")}>
                  <i className="fa-solid fa-bars" />
                </button>
              </div>
            </div>
            <div className="rbt-header-content">
              <div className="header-info">
                {/* The template ships only Unimart-branded logo files and there's no real
                    logo asset in public/ yet — same fix as the footer and same source of
                    truth (t("site.name")). Swap back to an <img> once a real logo exists. */}
                <div className="logo">
                  <Link href="/">
                    {t("site.name")}
                  </Link>
                </div>
              </div>
              <div className="header-info p-0 d-none d-xl-block ml--28">
                <a className="rbt-offcanvas-trigger-btn rbt-offcanvas-trigger-transparent-btn rbt-cat-offcanvas-activation rbt-burger-menu-bar" href="#!">
                  <div className="rbt-burger-menu-bar-wrapper">
                    <i className="rbt-line-btn">
                      <span className="rbt-lines" />
                    </i>
                    <i className="rbt-line-btn rbt-hover-effect">
                      <span className="rbt-lines" />
                    </i>
                  </div>
                </a>
              </div>
            </div>
          </div>
          <div className="rbt-header-content d-none d-xl-block">
            <div className="header-info">
              <MainBarSearch categories={categories} />
            </div>
          </div>
          <div className="header-right">
            <ul className="rbt-quick-access">
              <li className="rbt-access-box rbt-scroll-trigger fade_in animation-order-1 rbt-access-box-has-bg-hover d-none d-lg-flex">
                <a href={PLACEHOLDER.phoneHref} className="rbt-access-box-wrapper">
                  <div className="rbt-round-btn rbt-bg-static-gray">
                    <i className="fa-regular fa-phone" />
                  </div>
                  <div className="content p-0">
                    <p>
                      {t("contact.phone")}
                    </p>
                    <span>
                      {PLACEHOLDER.phone}
                    </span>
                  </div>
                </a>
              </li>
              <MainBarAccountLink />
              <li className="rbt-access-box rbt-scroll-trigger fade_in animation-order-3 rbt-access-box-has-bg-hover d-flex d-lg-none">
                <a className="search-trigger-active rbt-round-btn rbt-bg-static-gray rbt-modern-close-btn" href="#">
                  <i className="fa-regular fa-search search-icon" />
                  <div className="modern-close-wrapper" />
                </a>
              </li>
              <MainBarCartLink />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
