"use client";

import { useMobileMenu } from "@/context/mobile-menu-context";
import { t } from "@/lib/i18n";

// The hamberger-button itself, split out as its own client leaf (main-bar.tsx and
// sticky-header.tsx stay server components apart from this) so clicking it can open
// popup-mobile-menu.tsx via MobileMenuContext instead of navigating anywhere.
export function MobileMenuTriggerButton() {
  const { openMobileMenu } = useMobileMenu();

  return (
    <button className="hamberger-button rbt-round-btn" type="button" aria-label={t("nav.menu")} onClick={openMobileMenu}>
      <i className="fa-solid fa-bars" />
    </button>
  );
}
