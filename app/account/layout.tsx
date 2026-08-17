"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { t } from "@/lib/i18n";

const NAV_ITEMS = [
  { href: "/account/profile", labelKey: "account.profile" },
  { href: "/account/addresses", labelKey: "account.addresses" },
  { href: "/account/orders", labelKey: "account.orders" },
  { href: "/account/wishlist", labelKey: "account.wishlist" },
];

// Shared layout for all /account/* routes: guards access and shows the sidebar nav
export default function AccountLayout({ children }: LayoutProps<"/account">) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect signed-out users to login, then back to the page they wanted
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?redirect=${pathname}`);
    }
  }, [isLoading, user, pathname, router]);

  if (isLoading || !user) {
    return (
      <div className="container-page py-12 text-sm text-muted-foreground">{t("common.loading")}</div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[200px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {NAV_ITEMS.map((item) => {
            // Highlight the nav link matching the current or a nested route
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div>{children}</div>
      </div>
    </div>
  );
}