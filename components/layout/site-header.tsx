import { HeaderStickyController } from "@/components/layout/header-sticky-controller";
import { HeaderTopbar } from "@/components/layout/header-topbar";
import { MainBar } from "@/components/layout/main-bar";
import { NavBar } from "@/components/layout/nav-bar";
import { StickyHeader } from "@/components/layout/sticky-header";

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
export function SiteHeader() {
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
    </header>
  );
}
