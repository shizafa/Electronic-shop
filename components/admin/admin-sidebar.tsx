"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/client";
import { t } from "@/lib/i18n";
import { ADMIN_NAV_GROUPS, isAdminNavItemActive } from "@/components/admin/nav-items";

export function AdminSidebar() {
  const pathname = usePathname();
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);

  // Fetched once on mount (this component only ever mounts once a session is confirmed
  // admin — AdminLayout gates rendering on that), under reviews_select_admin RLS. Doesn't
  // live-update while sitting on /admin/reviews approving things; refreshes on next
  // navigation/mount instead — good enough for a sidebar hint, not a source of truth.
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .then(({ count }) => setPendingReviewsCount(count ?? 0));
  }, []);

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <Link href="/admin" className="flex items-center gap-2 px-2 py-1.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
            {t("site.name").slice(0, 1)}
          </span>
          <span className="text-base font-semibold text-sidebar-foreground">{t("site.name")}</span>
          <span className="text-xs text-sidebar-foreground/60">{t("admin.dashboard")}</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {ADMIN_NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.labelKey}>
            <SidebarGroupLabel>{t(group.labelKey)}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = isAdminNavItemActive(pathname, item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{t(item.labelKey)}</span>
                          {item.href === "/admin/reviews" && pendingReviewsCount > 0 && (
                            <Badge variant="default" className="ml-auto">
                              {pendingReviewsCount}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Plain link, not a route guarded/forced back to /admin — admins can browse
                the storefront like any other visitor once they're here. */}
            <SidebarMenuButton asChild>
              <Link href="/">
                <Store />
                <span>{t("admin.nav.viewStore")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
