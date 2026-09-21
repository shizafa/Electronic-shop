"use client";

import { useState, type FormEvent } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { updateWhyShopFeatures } from "@/lib/actions/admin/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/lib/i18n";
import type { StoreSettings, WhyShopFeature } from "@/lib/settings";

const DESC_MAX = 80;
const INTRO_MAX = 500;

type EditableFeature = WhyShopFeature & { key: string };

// Editable copy of components/product/product-description-panel.tsx's "Why shop with us"
// section shown below every product's description: an intro paragraph plus a card row. One
// shared setting for the whole catalog, edited here rather than per product.
//
// The cards' icon is fixed as stored in the database — this form only edits title/description
// per card, plus the intro paragraph above them. Admin is a separate Tailwind/shadcn stack that
// doesn't load Font Awesome, and the storefront must keep rendering real fa-* classes
// (CLAUDE.md forbids swapping those for lucide-react there), so there's no icon field or
// add/remove here.
export function WhyShopFeaturesForm({ initialSettings }: { initialSettings: StoreSettings }) {
  const [intro, setIntro] = useState(initialSettings.whyShopIntro ?? "");
  const [features, setFeatures] = useState<EditableFeature[]>(
    initialSettings.whyShopFeatures.map((feature) => ({ ...feature, key: crypto.randomUUID() }))
  );
  const [saved, setSaved] = useState<{ intro: string; features: WhyShopFeature[] }>({
    intro: initialSettings.whyShopIntro ?? "",
    features: initialSettings.whyShopFeatures,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strippedFeatures = features.map(({ icon, title, desc }) => ({ icon, title, desc }));
  const isDirty = intro !== saved.intro || JSON.stringify(strippedFeatures) !== JSON.stringify(saved.features);

  function updateFeature(key: string, updates: Partial<Pick<WhyShopFeature, "title" | "desc">>) {
    setFeatures((current) => current.map((feature) => (feature.key === key ? { ...feature, ...updates } : feature)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await updateWhyShopFeatures({ intro, features: strippedFeatures });

    setIsSubmitting(false);
    if (result.success) {
      setSaved({ intro, features: strippedFeatures });
      toast.success(t("admin.settings.whyShopFeaturesSaved"));
    } else {
      toast.error(result.error);
    }
  }

  function discardChanges() {
    setIntro(saved.intro);
    setFeatures(saved.features.map((feature) => ({ ...feature, key: crypto.randomUUID() })));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="max-w-2xl text-sm text-muted-foreground">{t("admin.settings.whyShopFeaturesHint")}</p>

      <div className="flex max-w-2xl flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="why-shop-intro">{t("admin.settings.whyShopIntro")}</Label>
          <span className="text-xs text-muted-foreground">
            {intro.length}/{INTRO_MAX}
          </span>
        </div>
        <Textarea
          id="why-shop-intro"
          rows={3}
          maxLength={INTRO_MAX}
          value={intro}
          onChange={(event) => setIntro(event.target.value.slice(0, INTRO_MAX))}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-3">
          {features.map((feature, index) => (
            <Card key={feature.key}>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("admin.settings.whyShopFeatureCard")} {index + 1}
                </p>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`why-shop-title-${feature.key}`}>{t("admin.settings.whyShopFeatureTitle")}</Label>
                  <Input
                    id={`why-shop-title-${feature.key}`}
                    value={feature.title}
                    onChange={(event) => updateFeature(feature.key, { title: event.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`why-shop-desc-${feature.key}`}>{t("admin.settings.whyShopFeatureDesc")}</Label>
                    <span className="text-xs text-muted-foreground">
                      {feature.desc.length}/{DESC_MAX}
                    </span>
                  </div>
                  <Textarea
                    id={`why-shop-desc-${feature.key}`}
                    rows={2}
                    maxLength={DESC_MAX}
                    className="min-h-0 resize-none"
                    value={feature.desc}
                    onChange={(event) => updateFeature(feature.key, { desc: event.target.value.slice(0, DESC_MAX) })}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:sticky lg:top-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">{t("admin.settings.whyShopFeaturesPreview")}</p>
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4">
            {intro && <p className="text-sm text-foreground">{intro}</p>}
            {features.map((feature) => (
              <div key={feature.key} className="rounded-lg bg-card p-3 text-center ring-1 ring-foreground/10">
                <div className="mx-auto flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="size-4" />
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">{feature.title || t("admin.settings.whyShopFeatureTitle")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isDirty && (
        <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
          <span className="text-sm text-muted-foreground">{t("admin.settings.unsavedChanges")}</span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={discardChanges} disabled={isSubmitting}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {t("admin.settings.saveWhyShopFeatures")}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
