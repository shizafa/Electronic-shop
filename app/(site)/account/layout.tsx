"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { t } from "@/lib/i18n";
import { getOrdersForUser } from "@/lib/orders";

// Nav entries backed by real routes; used for both the sidebar links and the breadcrumb's
// trailing label. Payment Methods / My reviews / Notifications / Terms have no page behind them
// yet (no such feature exists in this app) and stay as dead .html links, same treatment given
// to un-mapped demo pages elsewhere (e.g. mega-menue.tsx's element-*.html links) — "Help" points
// at /faqs since that's this app's real equivalent of a help center.
const ACCOUNT_NAV_ITEMS = [
  { href: "/account/orders", labelKey: "account.orders" },
  { href: "/account/addresses", labelKey: "account.addresses" },
  { href: "/account/profile", labelKey: "account.profile" },
  { href: "/account/wishlist", labelKey: "account.wishlist" },
];

function getBreadcrumbLabel(pathname: string): string {
  if (pathname.startsWith("/account/orders/")) return t("account.orderDetail");
  const match = ACCOUNT_NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return match ? t(match.labelKey) : t("account.yourAccount");
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
    getOrdersForUser(user.id).then((orders) => {
      if (active) setOrderCount(orders.length);
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
              <aside className="rbt-profile-sidebar sticky-top">
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
                      <a href="my-payment-methods.html">
                        <span>
                          <i className="fa-regular fa-money-bill mr--4" />
                          Payment Methods
                        </span>
                      </a>
                      <a href="my-reviews.html">
                        <span>
                          <i className="fa-regular fa-star-sharp-half-stroke mr--4" />
                          My reviews
                        </span>
                      </a>
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
                      <a href="account-notifications.html">
                        <span>
                          <i className="fa-regular fa-cowbell mr--4" />
                          Notifications
                        </span>
                      </a>
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
                      <a href="terms-policy.html">
                        <span>
                          <i className="fa-regular fa-circle-info mr--4" />
                          Terms and conditions
                        </span>
                      </a>
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
