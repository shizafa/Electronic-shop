"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Heart, LogOut, MapPin, Package, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { t } from "@/lib/i18n";

const NAV_ITEMS = [
  { href: "/account/orders", labelKey: "account.orders", icon: Package },
  { href: "/account/addresses", labelKey: "account.addresses", icon: MapPin },
  { href: "/account/profile", labelKey: "account.profile", icon: UserIcon },
  { href: "/account/wishlist", labelKey: "account.wishlist", icon: Heart },
];

// Shared layout for all /account/* routes: guards access and shows the sidebar nav
export default function AccountLayout({ children }: LayoutProps<"/account">) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoggingOutRef = useRef(false);

  // Redirect signed-out users to login, then back to the page they wanted.
  // Skipped during an explicit logout so it doesn't race handleLogout's own
  // navigation and bounce the user to the login page instead of home.
  useEffect(() => {
    if (!isLoading && !user && !isLoggingOutRef.current) {
      router.replace(`/login?redirect=${pathname}`);
    }
  }, [isLoading, user, pathname, router]);

  async function handleLogout() {
    isLoggingOutRef.current = true;
    await logout();
    router.push("/");
  }

  if (isLoading || !user) {
    return (
      <div className="container-page py-12 text-sm text-muted-foreground">{t("common.loading")}</div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("account.yourAccount")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {user.name}, {t("auth.email")}: {user.email}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {NAV_ITEMS.map((item) => {
            // Highlight the nav link matching the current or a nested route
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {t(item.labelKey)}
              </Link>
            );
          })}

          <div className="my-2 hidden border-t border-border lg:block" />

          <button
            type="button"
            onClick={handleLogout}
            className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" />
            {t("nav.logout")}
          </button>
        </nav>

        <div>{children}</div>
      </div>
    </div>
  );
}
