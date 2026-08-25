"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight } from "lucide-react";
import { AdminSearch } from "@/components/admin/admin-search";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth-context";
import { t } from "@/lib/i18n";
import { getActiveAdminNavItem } from "@/components/admin/nav-items";

// Turns "Ayesha Khan" into "AK" for the avatar badge; falls back to "?" if name is empty.
function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return initials || "?";
}

export function AdminTopbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const title = t(getActiveAdminNavItem(pathname)?.labelKey ?? "admin.dashboard");

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-border px-4">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger />
        <nav className="flex min-w-0 items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          <Link href="/admin" className="shrink-0 text-muted-foreground hover:text-foreground">
            {t("site.name")}
          </Link>
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="shrink-0 text-muted-foreground">{t("admin.dashboard")}</span>
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate font-medium text-foreground">{title}</span>
        </nav>
      </div>

      <div className="hidden flex-1 justify-center md:flex">
        <AdminSearch />
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Notifications">
              <Bell className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <div className="px-2 py-1.5 text-sm text-muted-foreground">No notifications yet.</div>
          </DropdownMenuContent>
        </DropdownMenu>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 ps-1.5 pe-2" size="sm">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {getInitials(user.name)}
                </span>
                <span className="hidden text-sm font-medium sm:inline">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => logout()}>{t("nav.logout")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
