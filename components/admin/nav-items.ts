import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Settings,
  MessageSquare,
  Star,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
}

export interface AdminNavGroup {
  labelKey: string;
  items: AdminNavItem[];
}

// Sidebar nav, grouped the way a larger admin dashboard would be (General/Catalog/Sales/
// Settings) even though each group here only holds one or two items today — new admin
// sections should land in the group they best fit rather than a new flat list entry.
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    labelKey: "admin.nav.group.general",
    items: [{ href: "/admin", labelKey: "admin.nav.overview", icon: LayoutDashboard }],
  },
  {
    labelKey: "admin.nav.group.catalog",
    items: [
      { href: "/admin/products", labelKey: "admin.nav.products", icon: Package },
      { href: "/admin/categories", labelKey: "admin.nav.categories", icon: FolderTree },
      { href: "/admin/reviews", labelKey: "admin.nav.reviews", icon: Star },
    ],
  },
  {
    labelKey: "admin.nav.group.sales",
    items: [
      { href: "/admin/orders", labelKey: "admin.nav.orders", icon: ShoppingCart },
      { href: "/admin/customers", labelKey: "admin.nav.customers", icon: Users },
    ],
  },
  {
    labelKey: "admin.nav.group.support",
    items: [{ href: "/admin/messages", labelKey: "admin.nav.messages", icon: MessageSquare }],
  },
  {
    labelKey: "admin.nav.group.settings",
    items: [{ href: "/admin/settings", labelKey: "admin.nav.settings", icon: Settings }],
  },
];

export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap((group) => group.items);

// Overview only matches the exact path; other sections also match their nested routes
// (e.g. /admin/products/new highlights the Products nav item).
export function isAdminNavItemActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

// Finds the nav item matching the current path, for deriving the top bar's page title/breadcrumb.
export function getActiveAdminNavItem(pathname: string): AdminNavItem | undefined {
  return ADMIN_NAV_ITEMS.find((item) => isAdminNavItemActive(pathname, item.href));
}
