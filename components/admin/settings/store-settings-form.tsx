"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { updateSettings } from "@/lib/actions/admin/settings";
import { StoreAssetUploader } from "@/components/admin/settings/store-asset-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/lib/i18n";
import type { StoreSettings } from "@/lib/settings";

export function StoreSettingsForm({ initialSettings }: { initialSettings: StoreSettings }) {
  const [storeName, setStoreName] = useState(initialSettings.storeName);
  const [tagline, setTagline] = useState(initialSettings.tagline ?? "");
  const [logoUrl, setLogoUrl] = useState<string | null>(initialSettings.logoUrl);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(initialSettings.faviconUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      toast.success(t("admin.settings.storeSaved"));
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="store-name">{t("admin.settings.storeName")}</Label>
        <Input id="store-name" required value={storeName} onChange={(event) => setStoreName(event.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="store-tagline">{t("admin.settings.tagline")}</Label>
        <Textarea id="store-tagline" rows={2} value={tagline} onChange={(event) => setTagline(event.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>{t("admin.settings.logo")}</Label>
          <StoreAssetUploader image={logoUrl} onChange={setLogoUrl} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>{t("admin.settings.favicon")}</Label>
          <StoreAssetUploader image={faviconUrl} onChange={setFaviconUrl} />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {t("admin.settings.saveStore")}
      </Button>
    </form>
  );
}
