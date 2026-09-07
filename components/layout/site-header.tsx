import { HeaderStickyController } from "@/components/layout/header-sticky-controller";
import { HeaderTopbar } from "@/components/layout/header-topbar";
import { MainBar } from "@/components/layout/main-bar";
import { NavBar } from "@/components/layout/nav-bar";
import { PopupMobileMenu } from "@/components/layout/popup-mobile-menu";
import { StickyHeader } from "@/components/layout/sticky-header";
import { getVisibleCategories } from "@/lib/categories";
import { getSettings } from "@/lib/settings";

// Assembles the full header region: <header class="rbt-header"> wrapping
// .rbt-header-wrapper (topbar + <hr> + main bar), .rbt-header-middle (NavBar, a sibling —
// not nested inside the wrapper) and the always-present sticky clone.
//
// This is the structural fix for the gap flagged when the sticky header was built: without
// a shared .rbt-header-wrapper ancestor, style.min.css's
// ".rbt-header-wrapper.rbt-sticky .rbt-topbar-section.rbt-topbar-one { display:none }"
// rule had nothing to hide, so the topbar would sit visible underneath the fixed sticky
// clone once scrolled. HeaderStickyController toggles .rbt-sticky on both the wrapper and
// the clone from one shared scroll listener.
//
// PopupMobileMenu is mounted once here rather than inside MainBar/StickyHeader (each of which
// has its own hamberger-button trigger) since it's a single shared overlay, not per-bar.
// getVisibleCategories/getSettings are wrapped in React's cache() in lib/, so calling them
// again here request-dedupes with MainBar/NavBar's own calls rather than re-querying Supabase.
export async function SiteHeader() {
  const [categories, settings] = await Promise.all([getVisibleCategories(), getSettings()]);

  return (
    <header className="rbt-header">
      <HeaderStickyController
        wrapper={
          <>
            <HeaderTopbar />
            <hr className="rbt-separator m-0" />
            <MainBar />
          </>
        }
        navBar={<NavBar />}
        stickyClone={<StickyHeader />}
      />
      <PopupMobileMenu categories={categories} logoUrl={settings.logoUrl} storeName={settings.storeName} />
    </header>
  );
}
