import Link from "next/link";
import { MainBarAccountLink } from "@/components/layout/main-bar-account-link";
import { MainBarCartLink } from "@/components/layout/main-bar-cart-link";
import { MainBarSearch } from "@/components/layout/main-bar-search";
import { MobileMenuTriggerButton } from "@/components/layout/mobile-menu-trigger-button";
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
// (hotline, account, mini-cart).
//
// Server component apart from three leaves (MainBarSearch, MainBarAccountLink,
// MainBarCartLink) that need client hooks — categories are fetched here and handed down as
// plain data rather than re-fetched client-side.
//
// .hamberger-button (mobile-menu-bar) opens popup-mobile-menu.tsx via MobileMenuContext (see
// mobile-menu-trigger-button.tsx) — that popup has its own working search field, so the
// template's separate .search-trigger-active mobile search icon (a second, not-yet-wired
// trigger for a whole other search UI, header-search.tsx's dropdown) was dropped rather than
// wired up as a redundant second way to search on the same screens. Account/profile now stays
// visible at every width instead of only d-lg-flex (>=992px) so mobile's header-right shows
// exactly two icons — account and cart — matching an explicit request.
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
                <MobileMenuTriggerButton />
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
              <MainBarCartLink />
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
