import Image from "next/image";
import { Globe, Search, ShoppingCart, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { t } from "@/lib/i18n";

interface StoreHeaderPreviewProps {
  storeName: string;
  tagline: string;
  logoUrl: string | null;
  faviconUrl: string | null;
}

// Approximation of the storefront header (components/layout/main-bar.tsx) plus a browser tab,
// driven by the unsaved form state so admins see branding changes before saving. Mirrors the
// storefront's logo-or-wordmark fallback.
export function StoreHeaderPreview({ storeName, tagline, logoUrl, faviconUrl }: StoreHeaderPreviewProps) {
  const name = storeName.trim();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.settings.preview")}</CardTitle>
        <CardDescription>{t("admin.settings.previewDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="flex items-center gap-3 border-b border-border bg-muted px-3 py-2">
            <div className="flex shrink-0 gap-1.5" aria-hidden>
              <span className="size-2.5 rounded-full bg-foreground/15" />
              <span className="size-2.5 rounded-full bg-foreground/15" />
              <span className="size-2.5 rounded-full bg-foreground/15" />
            </div>
            <div className="flex min-w-0 max-w-56 items-center gap-2 rounded-md bg-background px-2.5 py-1 text-xs shadow-sm">
              {faviconUrl ? (
                <Image src={faviconUrl} alt="" width={16} height={16} className="size-4 shrink-0 object-contain" />
              ) : (
                <Globe className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span className="truncate">{name || t("admin.settings.storeName")}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-background p-4">
            <div className="flex min-w-0 max-w-[50%] flex-col gap-1">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={name}
                  width={160}
                  height={40}
                  className="h-10 w-auto max-w-full object-contain object-left"
                />
              ) : (
                <span className={`truncate text-lg font-semibold ${name ? "text-foreground" : "text-muted-foreground"}`}>
                  {name || t("admin.settings.storeName")}
                </span>
              )}
              {tagline.trim() && <p className="line-clamp-2 text-xs text-muted-foreground">{tagline}</p>}
            </div>

            <div className="hidden min-w-0 flex-1 items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground sm:flex">
              <Search className="size-3.5 shrink-0" />
              <span className="truncate">{t("admin.settings.previewSearch")}</span>
            </div>

            <div className="ms-auto flex shrink-0 gap-2" aria-hidden>
              <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <User className="size-4" />
              </span>
              <span className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ShoppingCart className="size-4" />
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
