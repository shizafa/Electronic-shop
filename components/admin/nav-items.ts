import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", labelKey: "admin.nav.overview", icon: LayoutDashboard },
  { href: "/admin/products", labelKey: "admin.nav.products", icon: Package },
  { href: "/admin/categories", labelKey: "admin.nav.categories", icon: FolderTree },
  { href: "/admin/orders", labelKey: "admin.nav.orders", icon: ShoppingCart },
  { href: "/admin/customers", labelKey: "admin.nav.customers", icon: Users },
  { href: "/admin/settings", labelKey: "admin.nav.settings", icon: Settings },
];

// Overview only matches the exact path; other sections also match their nested routes
// (e.g. /admin/products/new highlights the Products nav item).
export function isAdminNavItemActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

// Finds the nav item matching the current path, for deriving the top bar's page title.
export function getActiveAdminNavItem(pathname: string): AdminNavItem | undefined {
  return ADMIN_NAV_ITEMS.find((item) => isAdminNavItemActive(pathname, item.href));
}
