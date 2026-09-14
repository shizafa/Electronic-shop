"use client";

import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { updateSettings } from "@/lib/actions/admin/settings";
import { StoreAssetUploader } from "@/components/admin/settings/store-asset-uploader";
import { StoreHeaderPreview } from "@/components/admin/settings/store-header-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/lib/i18n";
import type { StoreSettings } from "@/lib/settings";

// Matches the tagline max in lib/actions/admin/settings.ts.
const TAGLINE_MAX = 300;

export function StoreSettingsForm({ initialSettings }: { initialSettings: StoreSettings }) {
  const [storeName, setStoreName] = useState(initialSettings.storeName);
  const [tagline, setTagline] = useState(initialSettings.tagline ?? "");
  const [logoUrl, setLogoUrl] = useState<string | null>(initialSettings.logoUrl);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(initialSettings.faviconUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  // Last-saved values — the dirty check compares against these, not initialSettings, so the
  // button disables again after a successful save.
  const [saved, setSaved] = useState({
    storeName: initialSettings.storeName,
    tagline: initialSettings.tagline ?? "",
    logoUrl: initialSettings.logoUrl,
    faviconUrl: initialSettings.faviconUrl,
  });

  const isDirty =
    storeName !== saved.storeName ||
    tagline !== saved.tagline ||
    logoUrl !== saved.logoUrl ||
    faviconUrl !== saved.faviconUrl;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await updateSettings({
      storeName,
      tagline: tagline || undefined,
      logoUrl,
      faviconUrl,
    });

    setIsSubmitting(false);
    if (result.success) {
      setSaved({ storeName, tagline, logoUrl, faviconUrl });
      setJustSaved(true);
      toast.success(t("admin.settings.storeSaved"));
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.settings.identity")}</CardTitle>
            <CardDescription>{t("admin.settings.identityDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="store-name">
                {t("admin.settings.storeName")}
                <span className="text-destructive" aria-hidden>
                  *
                </span>
                <span className="sr-only">({t("admin.settings.required")})</span>
              </Label>
              <Input id="store-name" required value={storeName} onChange={(event) => setStoreName(event.target.value)} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="store-tagline">{t("admin.settings.tagline")}</Label>
              <Textarea
                id="store-tagline"
                rows={2}
                maxLength={TAGLINE_MAX}
                aria-describedby="store-tagline-count"
                value={tagline}
                onChange={(event) => setTagline(event.target.value)}
              />
              <p id="store-tagline-count" className="text-end text-xs text-muted-foreground tabular-nums">
                {tagline.length}/{TAGLINE_MAX}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.settings.branding")}</CardTitle>
            <CardDescription>{t("admin.settings.brandingDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>{t("admin.settings.logo")}</Label>
              <StoreAssetUploader image={logoUrl} onChange={setLogoUrl} />
              <p className="text-xs text-muted-foreground">
                {t("admin.settings.logoHint")}
                <br />
                {t("admin.settings.dropHint")}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t("admin.settings.favicon")}</Label>
              <StoreAssetUploader image={faviconUrl} onChange={setFaviconUrl} />
              <p className="text-xs text-muted-foreground">
                {t("admin.settings.faviconHint")}
                <br />
                {t("admin.settings.dropHint")}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {t("admin.settings.saveStore")}
          </Button>
          {justSaved && !isDirty && (
            <span role="status" className="flex items-center gap-1 text-sm text-muted-foreground">
              <Check className="size-4 text-primary" />
              {t("admin.settings.storeSavedInline")}
            </span>
          )}
        </div>
      </form>

      <StoreHeaderPreview storeName={storeName} tagline={tagline} logoUrl={logoUrl} faviconUrl={faviconUrl} />
    </div>
  );
}
