import Link from "next/link";
import { MainBarAccountLink } from "@/components/layout/main-bar-account-link";
import { MainBarCartLink } from "@/components/layout/main-bar-cart-link";
import { MainBarSearch } from "@/components/layout/main-bar-search";
import { getVisibleCategories } from "@/lib/categories";
import { getSettings } from "@/lib/settings";
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
//   - .search-trigger-active (mobile search icon): wired in the "search dropdown" step
//
// The desktop category off-canvas trigger (.rbt-cat-offcanvas-activation, the burger icon
// that sat next to the logo) was dropped at the user's request — it was never wired to a
// panel anyway (not in the build order), and its removal frees up room for the wordmark.
export async function MainBar() {
  const [categories, settings] = await Promise.all([getVisibleCategories(), getSettings()]);

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
                <div className="logo">
                  <Link href="/">
                    {settings.logoUrl ? <img src={settings.logoUrl} alt={settings.storeName} /> : settings.storeName}
                  </Link>
                </div>
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
