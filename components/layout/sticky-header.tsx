import Link from "next/link";
import { NavMenu } from "@/components/layout/nav-menu";
import { StickyHeaderAccountLink } from "@/components/layout/sticky-header-account-link";
import { StickyHeaderCartLink } from "@/components/layout/sticky-header-cart-link";
import { StickyHeaderCampaign } from "@/components/layout/sticky-header-campaign";
import { StickyHeaderCompareLink } from "@/components/layout/sticky-header-compare-link";
import { StickyHeaderWishlistLink } from "@/components/layout/sticky-header-wishlist-link";
import { getSettings } from "@/lib/settings";
import { t } from "@/lib/i18n";

// Content of the sticky header clone. The .rbt-header-common-sticky-activation wrapper div
// and its .rbt-sticky toggle live in header-sticky-controller.tsx now, alongside the same
// toggle on .rbt-header-wrapper — both need to flip in the same scroll event (confirmed in
// style.min.css: .rbt-header-wrapper.rbt-sticky hides the original topbar, while
// .rbt-header-common-sticky-activation.rbt-sticky reveals this clone), so one shared
// controller owns the state instead of two independent listeners.
//
// Reuses <NavMenu /> rather than re-porting the nav; the two calls to
// getVisibleCategories/getAllProducts inside it (one from NavBar, one from here) request-
// dedupe via React's cache() in lib/, so this isn't a second Supabase round-trip.
export async function StickyHeader() {
  const settings = await getSettings();

  return (
    <>
  <StickyHeaderCampaign />
  <div className="container">
    <div className="mainbar-row rbt-mainbar-row-md-height  align-items-center">
      <div className="header-left">
        <div className="rbt-header-content d-flex">
          <div className="header-info d-xl-block d-none">
            <div className="logo rbt-logo-height-sm">
              <Link href="/">
                {settings.logoUrl ? <img src={settings.logoUrl} alt={settings.storeName} /> : settings.storeName}
              </Link>
            </div>
          </div>
        </div>
        <div className="mobile-menu-bar d-block d-xl-none">
          <div className="hamberger">
            <button className="hamberger-button rbt-round-btn" type="button" aria-label={t("nav.menu")}>
              <i className="fa-solid fa-bars" />
            </button>
          </div>
        </div>
      </div>
      <div className="header-info d-xl-none d-block">
        <div className="logo">
          <Link href="/">
            {settings.logoUrl ? <img src={settings.logoUrl} alt={settings.storeName} /> : settings.storeName}
          </Link>
        </div>
      </div>
      <div className="rbt-header-content d-none d-xl-block">
        <div className="header-info">
          <NavMenu />
        </div>
      </div>
      <div className="header-right">
        <ul className="rbt-quick-access rbt-gap--12">
          <li className="rbt-access-box rbt-scroll-trigger fade_in animation-order-3 tooltips tooltip-distance-lg" data-tooltip="Search" data-tooltip-position="bottom">
            <a className="rbt-round-btn has-rbt-md-fsize rbt-common-search-trigger-active rbt-modern-close-btn" href="#">
              <i className="fa-regular fa-search search-icon" />
              <div className="modern-close-wrapper" />
            </a>
          </li>
          <StickyHeaderAccountLink />
          <StickyHeaderCompareLink />
          <StickyHeaderWishlistLink />
          <StickyHeaderCartLink />
        </ul>
      </div>
    </div>
  </div>
    </>
  );
}
