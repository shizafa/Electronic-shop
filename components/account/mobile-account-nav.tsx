"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { t } from "@/lib/i18n";

interface MobileAccountNavItem {
  href: string;
  icon: string;
  label: string;
}

interface MobileAccountNavProps {
  orderCount: number | null;
  onLogout: () => void;
}

const ARROW_BUTTON_STYLE: CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 3,
  width: 26,
  height: 26,
  lineHeight: "26px",
  fontSize: 11,
  background: "var(--color-white)",
  boxShadow: "var(--shadow-1, 0 2px 8px rgba(0,0,0,.15))",
};

// Mobile stand-in for the desktop `rbt-profile-sidebar`: below 768px that sidebar's own CSS
// caps it at max-height:360px with a visible internal scrollbar (style.min.css, @media
// max-width:767px), which reads as broken on a phone. This reuses `rbt-fshape-tab`'s
// horizontally-scrolling, hidden-scrollbar nav-tabs container (already used for the product
// page's tabs — see product-tabs.tsx) purely for its overflow-x:auto/flex-nowrap scroll
// behavior, as a horizontal strip of real links rather than tab-panel switches. Its decorative
// folder-tab SVG corners are dropped (they imply a directly-adjacent tab-content panel, which
// doesn't apply to page navigation). Its 52px shape-reserved padding and matching -26px
// negative margin (meant to let those SVG corners interlock) are overridden inline — without
// them the negative margin just overlaps adjacent links — for the same vendor-CSS-can't-be-
// edited reason product-tabs.tsx sets flexShrink inline instead of in style.min.css.
//
// Since the scrollbar itself is intentionally hidden (that's the whole point of reusing
// rbt-fshape-tab), there'd be no visible affordance that the strip scrolls at all — so small
// rbt-round-btn chevrons are layered over each edge, shown only while there's more content in
// that direction (tracked off the list's own scrollLeft/scrollWidth), and click-to-scroll too.
export function MobileAccountNav({ orderCount, onLogout }: MobileAccountNavProps) {
  const pathname = usePathname();
  const listRef = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollState() {
    const el = listRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  useEffect(() => {
    updateScrollState();
    const el = listRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  function scrollByAmount(amount: number) {
    listRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  function isActive(href: string): boolean {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const items: MobileAccountNavItem[] = [
    { href: "/account/orders", icon: "fa-regular fa-cart-shopping-fast", label: t("account.orders") },
    { href: "/account/wishlist", icon: "fa-regular fa-heart", label: t("account.wishlist") },
    { href: "/account/payment-methods", icon: "fa-regular fa-money-bill", label: "Payment Methods" },
    { href: "/account/reviews", icon: "fa-regular fa-star-sharp-half-stroke", label: "My reviews" },
    { href: "/account/profile", icon: "fa-regular fa-user-vneck", label: t("account.profile") },
    { href: "/account/addresses", icon: "fa-regular fa-location-dot", label: t("account.addresses") },
    { href: "/account/notifications", icon: "fa-regular fa-cowbell", label: "Notifications" },
    { href: "/faqs", icon: "fa-regular fa-circle-question", label: "Help" },
    { href: "/terms", icon: "fa-regular fa-circle-info", label: "Terms and conditions" },
  ];

  return (
    <div className="rbt-tab rbt-fshape-tab d-block d-md-none mb--16">
      <div className="rbt-tab-nav-wrapper" style={{ position: "relative" }}>
        {canScrollLeft && (
          <button
            type="button"
            className="rbt-round-btn"
            style={{ ...ARROW_BUTTON_STYLE, left: 0 }}
            aria-label="Scroll left"
            onClick={() => scrollByAmount(-120)}
          >
            <i className="fa-solid fa-chevron-left" />
          </button>
        )}
        <ul
          className="nav nav-tabs mb--0"
          ref={listRef}
          style={{ paddingLeft: 30, paddingRight: 30 }}
        >
          {items.map((item) => (
            <li className="nav-item" key={item.href} style={{ flexShrink: 0 }}>
              <Link
                href={item.href}
                className={`nav-link${isActive(item.href) ? " active" : ""}`}
                style={{ padding: "10px 14px", margin: 0 }}
              >
                <i className={`${item.icon} mr--4`} />
                {item.label}
                {item.href === "/account/orders" && !!orderCount && (
                  <span className="badge bg-primary rounded-pill ms-2">{orderCount}</span>
                )}
              </Link>
            </li>
          ))}
          <li className="nav-item" style={{ flexShrink: 0 }}>
            <button type="button" className="nav-link" style={{ padding: "10px 14px", margin: 0 }} onClick={onLogout}>
              <i className="fa-regular fa-right-from-bracket mr--4" />
              {t("nav.logout")}
            </button>
          </li>
        </ul>
        {canScrollRight && (
          <button
            type="button"
            className="rbt-round-btn"
            style={{ ...ARROW_BUTTON_STYLE, right: 0 }}
            aria-label="Scroll right"
            onClick={() => scrollByAmount(120)}
          >
            <i className="fa-solid fa-chevron-right" />
          </button>
        )}
      </div>
    </div>
  );
}
