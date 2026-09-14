"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { updatePolicies } from "@/lib/actions/admin/settings";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { renderMarkdown } from "@/lib/markdown";
import { t } from "@/lib/i18n";
import type { StoreSettings } from "@/lib/settings";

type PolicyKey = "shippingPolicy" | "returnPolicy" | "privacyPolicy" | "terms";

// titleKey/path match the storefront policy pages under app/(site)/. Privacy and Terms usually
// run longer, so their textareas start taller.
const POLICIES: { key: PolicyKey; id: string; labelKey: string; titleKey: string; path: string; long: boolean }[] = [
  {
    key: "shippingPolicy",
    id: "shipping-policy",
    labelKey: "admin.settings.shippingPolicy",
    titleKey: "footer.shippingInstallation",
    path: "/shipping-policy",
    long: false,
  },
  {
    key: "returnPolicy",
    id: "return-policy",
    labelKey: "admin.settings.returnPolicy",
    titleKey: "footer.returnsWarranty",
    path: "/return-policy",
    long: false,
  },
  {
    key: "privacyPolicy",
    id: "privacy-policy",
    labelKey: "admin.settings.privacyPolicy",
    titleKey: "footer.privacyPolicy",
    path: "/privacy-policy",
    long: true,
  },
  {
    key: "terms",
    id: "terms",
    labelKey: "admin.settings.terms",
    titleKey: "footer.termsOfService",
    path: "/terms",
    long: true,
  },
];

// Same heading/body classes as the storefront policy pages, so the preview matches them. Keep in
// sync if those pages are re-skinned.
const POLICY_TITLE_CLASS = "text-3xl font-semibold tracking-tight text-foreground";
const POLICY_BODY_CLASS =
  "mt-6 text-foreground [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:mt-4 [&_h4]:font-semibold [&_p]:mt-4 [&_p]:leading-relaxed [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1";

export function StorePoliciesForm({ initialSettings }: { initialSettings: StoreSettings }) {
  const [policies, setPolicies] = useState<Record<PolicyKey, string>>({
    shippingPolicy: initialSettings.shippingPolicy ?? "",
    returnPolicy: initialSettings.returnPolicy ?? "",
    privacyPolicy: initialSettings.privacyPolicy ?? "",
    terms: initialSettings.terms ?? "",
  });
  const [previewKey, setPreviewKey] = useState<PolicyKey | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previewPolicy = POLICIES.find((policy) => policy.key === previewKey);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await updatePolicies({
      shippingPolicy: policies.shippingPolicy || undefined,
      returnPolicy: policies.returnPolicy || undefined,
      privacyPolicy: policies.privacyPolicy || undefined,
      terms: policies.terms || undefined,
    });

    setIsSubmitting(false);
    if (result.success) {
      toast.success(t("admin.settings.policiesSaved"));
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-4">
      {POLICIES.map((policy) => (
        <div key={policy.key} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor={policy.id}>{t(policy.labelKey)}</Label>
            <Button
              type="button"
              variant="link"
              size="xs"
              className="h-auto p-0"
              disabled={!policies[policy.key].trim()}
              onClick={() => setPreviewKey(policy.key)}
            >
              {t("admin.settings.previewPolicy")}
            </Button>
          </div>
          <p id={`${policy.id}-hint`} className="text-xs text-muted-foreground">
            {t("admin.settings.markdownHint")}
          </p>
          <Textarea
            id={policy.id}
            rows={policy.long ? 16 : 8}
            className={policy.long ? "min-h-80" : "min-h-40"}
            aria-describedby={`${policy.id}-hint`}
            value={policies[policy.key]}
            onChange={(event) => setPolicies((current) => ({ ...current, [policy.key]: event.target.value }))}
          />
        </div>
      ))}

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {t("admin.settings.savePolicies")}
      </Button>

      <Dialog open={previewKey !== null} onOpenChange={(open) => !open && setPreviewKey(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("admin.settings.policyPreview")}</DialogTitle>
            <DialogDescription>{previewPolicy?.path}</DialogDescription>
          </DialogHeader>
          {previewPolicy && (
            <div className="rounded-lg border border-border p-6">
              <h1 className={POLICY_TITLE_CLASS}>{t(previewPolicy.titleKey)}</h1>
              <div
                className={POLICY_BODY_CLASS}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(policies[previewPolicy.key]) }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </form>
  );
}
