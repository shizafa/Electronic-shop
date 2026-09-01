"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/context/auth-context";
import { t } from "@/lib/i18n";

// Shared layout for all /admin/* routes: guards access to admins only and shows the
// dashboard shell. Unlike AccountLayout (login-gated only), this also redirects
// logged-in-but-non-admin users away — they never see a flash of admin content since
// the loading state stays up until user.isAdmin is confirmed true.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(`/login?next=${pathname}`);
      return;
    }
    if (!user.isAdmin) {
      router.replace("/");
    }
  }, [isLoading, user, pathname, router]);

  if (isLoading || !user || !user.isAdmin) {
    return (
      <div className="container-page py-12 text-sm text-muted-foreground">{t("common.loading")}</div>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminTopbar />
        <div className="container-page py-6">{children}</div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
