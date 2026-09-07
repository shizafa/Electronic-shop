import { NavMenu } from "@/components/layout/nav-menu";

// The bottom nav bar — .rbt-header-middle, the blue bar in the reference design. A sibling
// of the main bar's .rbt-wrapper-middle, not nested inside it (different class, confirmed
// in style.min.css: .rbt-header-middle{position:relative} vs the main bar's
// .rbt-wrapper-middle.rbt-header-middle-one).
//
// rbt-bg-color-primary is a real style.min.css utility (background-color:var(--color-primary)
// !important) that also flips the nav link color to white via the scoped selector
// ".rbt-header-middle.rbt-bg-color-primary .rbt-mainmenu-nav .mainmenu>li>a" — pairs with
// .mainmenu's has-nav-bg-shape-hover class (nav-menu.tsx) for the translucent-white hover pill.
//
// Only .rbt-header-middle, .rbt-bg-color-primary, and the .container inside it are real
// classes confirmed for this bar. The reference screenshot's right-hand "Special Offers |
// Recent Viewed" links and whatever row wrapper sits between .container and <nav> haven't
// been pasted, so they're not built here rather than invented — this renders NavMenu alone
// until that markup exists.
//
// d-none d-xl-block: below 1200px this bar's content (Shop/About/Contact Us/Present Deals)
// moves into popup-mobile-menu.tsx's "Menu" tab instead, opened via the hamberger-button
// (main-bar.tsx's own mobile-only trigger, d-block d-xl-none — the same breakpoint, inverted).
// Showing both at once would duplicate the same nav twice on a phone screen.
export async function NavBar() {
  return (
    <div className="rbt-header-middle rbt-bg-color-primary d-none d-xl-block">
      <div className="container">
        {/* rbt-main-navigation isn't decorative — style.min.css's dropdown/megamenu hide
            rules are scoped as ".rbt-main-navigation .rbt-mainmenu-nav .mainmenu li...",
            so without this ancestor .rbt-megamenu/.submenu get no position/opacity rules
            at all and render as plain, permanently-visible <div>s. */}
        <div className="rbt-main-navigation">
          <NavMenu />
        </div>
      </div>
    </div>
  );
}
