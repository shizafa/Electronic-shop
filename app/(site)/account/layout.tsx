"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { MobileAccountNav } from "@/components/account/mobile-account-nav";
import { t } from "@/lib/i18n";
import { getOrdersForUser } from "@/lib/orders";

// Nav entries backed by real routes; used for both the sidebar links and the breadcrumb's
// trailing label. "Help" points at /faqs since that's this app's real equivalent of a help
// center. Payment Methods / My reviews / Notifications are backed by their own tables
// (payment_methods, notification_preferences, and reviews' own-row RLS — see
// supabase/migrations/0014-0016) — see each page's own component for its data flow.
// New entries (payment-methods/reviews/notifications) use a plain `label` instead of t() —
// lib/i18n.ts is off-limits to edit in this phase, and t() falls back to returning the raw key
// string for anything not already in its dictionaries.
const ACCOUNT_NAV_ITEMS = [
  { href: "/account/orders", label: t("account.orders") },
  { href: "/account/addresses", label: t("account.addresses") },
  { href: "/account/profile", label: t("account.profile") },
  { href: "/account/wishlist", label: t("account.wishlist") },
  { href: "/account/payment-methods", label: "Payment Methods" },
  { href: "/account/reviews", label: "My reviews" },
  { href: "/account/notifications", label: "Notifications" },
];

function getBreadcrumbLabel(pathname: string): string {
  if (pathname.startsWith("/account/orders/")) return t("account.orderDetail");
  const match = ACCOUNT_NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return match ? match.label : t("account.yourAccount");
}

// Shared shell for all /account/* routes: guards access, and renders the template's
// breadcrumb + profile sidebar (avatar, nav, logout) around whatever page is active.
export default function AccountLayout({ children }: LayoutProps<"/account">) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoggingOutRef = useRef(false);
  const [orderCount, setOrderCount] = useState<number | null>(null);

  // Redirect signed-out users to login, then back to the page they wanted.
  // Skipped during an explicit logout so it doesn't race handleLogout's own
  // navigation and bounce the user to the login page instead of home.
  useEffect(() => {
    if (!isLoading && !user && !isLoggingOutRef.current) {
      router.replace(`/login?next=${pathname}`);
    }
  }, [isLoading, user, pathname, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    getOrdersForUser(user.id)
      .then((orders) => {
        if (active) setOrderCount(orders.length);
      })
      .catch((error) => {
        // nav badge only — leave the count hidden; the orders page shows the error itself
        console.error(error);
      });
    return () => {
      active = false;
    };
  }, [user]);

  async function handleLogout() {
    isLoggingOutRef.current = true;
    await logout();
    router.push("/");
  }

  if (isLoading || !user) {
    return (
      <div className="container-page py-12 text-base text-muted-foreground">{t("common.loading")}</div>
    );
  }

  function isActive(href: string): boolean {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <div className="rbt-breadcrumb-two rbt-bg-color-gray-100">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="rbt-breadcrumb-inner text-left">
                <ul className="rbt-breadcrumb-page-list justify-content-start mt--0">
                  <li className="rbt-breadcrumb-item">
                    <Link href="/">
                      Home
                    </Link>
                  </li>
                  <li>
                    <div className="icon-right">
                      <i className="fa-solid fa-chevron-right" />
                    </div>
                  </li>
                  <li className="rbt-breadcrumb-item">
                    <Link href="/account/profile">
                      {t("account.yourAccount")}
                    </Link>
                  </li>
                  <li>
                    <div className="icon-right">
                      <i className="fa-solid fa-chevron-right" />
                    </div>
                  </li>
                  <li className="rbt-breadcrumb-item active">
                    {getBreadcrumbLabel(pathname)}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="rbt-component-area rbt-section-gap rbt-bg-color-gray-light">
        <div className="container">
          <div className="row row--12 mt_dec--24">
            <div className="col-12 col-md-12 col-lg-4 col-xl-3 mt--24">
              <MobileAccountNav orderCount={orderCount} onLogout={handleLogout} />
              <aside className="rbt-profile-sidebar sticky-top d-none d-md-block">
                <div className="rbt-user-profile">
                  <figure className="rbt-user-profile-img rbt-bg-color-primary d-flex align-items-center justify-content-center">
                    <span className="rbt-text-white rbt-text-bold h6 mb--0">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </figure>
                  <div className="pl--12">
                    <h2 className="h6 mb-1">
                      {user.name}
                    </h2>
                  </div>
                </div>
                <hr className="mb--8 mt--20" />
                <div className="rbt-sidebar-widgets">
                  <div className="rbt-sidebar-single-widget">
                    <nav className="rbt-sidebar-nav-list list-group">
                      <Link href="/account/orders" className={isActive("/account/orders") ? "active" : undefined}>
                        <span>
                          <i className="fa-regular fa-cart-shopping-fast mr--4" />
                          {t("account.orders")}
                        </span>
                        {!!orderCount && (
                          <span className="badge bg-primary rounded-pill ms-auto">
                            {orderCount}
                          </span>
                        )}
                      </Link>
                      <Link href="/account/wishlist" className={isActive("/account/wishlist") ? "active" : undefined}>
                        <span>
                          <i className="fa-regular fa-heart mr--4" />
                          {t("account.wishlist")}
                        </span>
                      </Link>
                      <Link href="/account/payment-methods" className={isActive("/account/payment-methods") ? "active" : undefined}>
                        <span>
                          <i className="fa-regular fa-money-bill mr--4" />
                          Payment Methods
                        </span>
                      </Link>
                      <Link href="/account/reviews" className={isActive("/account/reviews") ? "active" : undefined}>
                        <span>
                          <i className="fa-regular fa-star-sharp-half-stroke mr--4" />
                          My reviews
                        </span>
                      </Link>
                    </nav>
                  </div>
                  <div className="rbt-sidebar-single-widget">
                    <h2 className="rbt-title h6">
                      Manage account
                    </h2>
                    <nav className="rbt-sidebar-nav-list list-group">
                      <Link href="/account/profile" className={isActive("/account/profile") ? "active" : undefined}>
                        <span>
                          <i className="fa-regular fa-user-vneck mr--4" />
                          {t("account.profile")}
                        </span>
                      </Link>
                      <Link href="/account/addresses" className={isActive("/account/addresses") ? "active" : undefined}>
                        <span>
                          <i className="fa-regular fa-location-dot mr--4" />
                          {t("account.addresses")}
                        </span>
                      </Link>
                      <Link href="/account/notifications" className={isActive("/account/notifications") ? "active" : undefined}>
                        <span>
                          <i className="fa-regular fa-cowbell mr--4" />
                          Notifications
                        </span>
                      </Link>
                    </nav>
                  </div>
                  <div className="rbt-sidebar-single-widget">
                    <h2 className="rbt-title h6">
                      Customer service
                    </h2>
                    <nav className="rbt-sidebar-nav-list list-group">
                      <Link href="/faqs">
                        <span>
                          <i className="fa-regular fa-circle-question mr--4" />
                          Help
                        </span>
                      </Link>
                      <Link href="/terms">
                        <span>
                          <i className="fa-regular fa-circle-info mr--4" />
                          Terms and conditions
                        </span>
                      </Link>
                    </nav>
                  </div>
                  <hr />
                  <nav className="rbt-sidebar-nav-list list-group">
                    <button type="button" onClick={handleLogout}>
                      <span>
                        <i className="fa-regular fa-right-from-bracket mr--4" />
                        {t("nav.logout")}
                      </span>
                    </button>
                  </nav>
                </div>
              </aside>
            </div>
            <div className="col-12 col-md-12 col-lg-8 col-xl-9 mt--24">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
