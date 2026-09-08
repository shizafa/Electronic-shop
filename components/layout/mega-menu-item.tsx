"use client";

import { useState, type MouseEvent, type ReactNode } from "react";

interface MegaMenuItemProps {
  className: string;
  trigger: ReactNode;
  menu: ReactNode;
}

// The megamenu opens on CSS :hover (li.with-rbt-megamenu:hover .rbt-megamenu, in
// style.min.css) — no JS needed for that. But NavMenu is part of the shared site layout, so
// a Link click inside the menu navigates client-side without unmounting this <li>; if the
// cursor hasn't physically moved off it yet, :hover is still true and the menu stays open
// over the new page. This force-closes it on any click inside the menu panel, then lets
// :hover govern again once the mouse actually leaves and re-enters.
export function MegaMenuItem({ className, trigger, menu }: MegaMenuItemProps) {
  const [forceClosed, setForceClosed] = useState(false);

  function handleMenuClick(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("a, button")) {
      setForceClosed(true);
    }
  }

  return (
    <li className={className} onMouseLeave={() => setForceClosed(false)}>
      {trigger}
      {/* display:contents keeps this wrapper out of the box tree — the descendant selector
          driving the menu's hover-open (li.with-rbt-megamenu:hover .rbt-megamenu) and the
          menu's own absolute positioning against an ancestor further up both still resolve
          exactly as if this div weren't here; it only exists to catch clicks and force-hide. */}
      <div onClick={handleMenuClick} style={{ display: forceClosed ? "none" : "contents" }}>
        {menu}
      </div>
    </li>
  );
}
