"use client";

import { useEffect, useState, type ReactNode } from "react";

// Scroll threshold isn't in style.min.css (that only defines what .rbt-sticky *does*, not
// when JS should add it) — 200px is a reasonable stand-in for "past the normal header",
// not a value read from the template's own (unported) scroll-trigger JS.
const STICKY_SCROLL_THRESHOLD = 200;

interface HeaderStickyControllerProps {
  wrapper: ReactNode; // topbar + <hr> + main bar — goes inside .rbt-header-wrapper
  navBar: ReactNode; // .rbt-header-middle — sibling, untouched by the sticky class
  stickyClone: ReactNode; // the sticky nav's own content — goes inside the sticky-activation div
}

// Single scroll listener driving BOTH halves of the template's sticky behavior, confirmed
// from style.min.css:
//   .rbt-header-wrapper.rbt-sticky .rbt-topbar-section.rbt-topbar-one { display:none }
//   .rbt-header-wrapper.rbt-sticky { background-color:#fff; box-shadow:... }
//   .rbt-header-common-sticky-activation.rbt-sticky { position:fixed; opacity:1; ... }
// The first two hide the original topbar and restyle the wrapper it lives in; the third
// reveals the fixed clone. Both need the exact same isSticky value at the exact same time,
// so this is one boolean and one listener rather than two independent ones on separate
// components (which could drift a frame apart, or double up the scroll handler).
export function HeaderStickyController({ wrapper, navBar, stickyClone }: HeaderStickyControllerProps) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsSticky(window.scrollY > STICKY_SCROLL_THRESHOLD);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className={`rbt-header-wrapper${isSticky ? " rbt-sticky" : ""}`}>
        {wrapper}
      </div>
      {navBar}
      <div className={`rbt-header-common-sticky-activation rbt-header-wrapper-common justify-content-between rbt-bg-color-white${isSticky ? " rbt-sticky" : ""}`}>
        {stickyClone}
      </div>
    </>
  );
}
