"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { updatePolicies } from "@/lib/actions/admin/settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/lib/i18n";
import type { StoreSettings } from "@/lib/settings";

export function StorePoliciesForm({ initialSettings }: { initialSettings: StoreSettings }) {
  const [shippingPolicy, setShippingPolicy] = useState(initialSettings.shippingPolicy ?? "");
  const [returnPolicy, setReturnPolicy] = useState(initialSettings.returnPolicy ?? "");
  const [privacyPolicy, setPrivacyPolicy] = useState(initialSettings.privacyPolicy ?? "");
  const [terms, setTerms] = useState(initialSettings.terms ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await updatePolicies({
      shippingPolicy: shippingPolicy || undefined,
      returnPolicy: returnPolicy || undefined,
      privacyPolicy: privacyPolicy || undefined,
      terms: terms || undefined,
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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="shipping-policy">{t("admin.settings.shippingPolicy")}</Label>
        <Textarea
          id="shipping-policy"
          rows={8}
          value={shippingPolicy}
          onChange={(event) => setShippingPolicy(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="return-policy">{t("admin.settings.returnPolicy")}</Label>
        <Textarea
          id="return-policy"
          rows={8}
          value={returnPolicy}
          onChange={(event) => setReturnPolicy(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="privacy-policy">{t("admin.settings.privacyPolicy")}</Label>
        <Textarea
          id="privacy-policy"
          rows={8}
          value={privacyPolicy}
          onChange={(event) => setPrivacyPolicy(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="terms">{t("admin.settings.terms")}</Label>
        <Textarea id="terms" rows={8} value={terms} onChange={(event) => setTerms(event.target.value)} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {t("admin.settings.savePolicies")}
      </Button>
    </form>
  );
}
