"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { updateCommerce } from "@/lib/actions/admin/settings";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "@/lib/i18n";
import type { StoreSettings } from "@/lib/settings";

export function StoreCommerceForm({ initialSettings }: { initialSettings: StoreSettings }) {
  const [currencyCode, setCurrencyCode] = useState(initialSettings.currencyCode);
  const [currencySymbol, setCurrencySymbol] = useState(initialSettings.currencySymbol);
  const [shippingFlatRate, setShippingFlatRate] = useState(String(initialSettings.shippingFlatRate));
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    initialSettings.freeShippingThreshold !== null ? String(initialSettings.freeShippingThreshold) : ""
  );
  const [taxPercent, setTaxPercent] = useState(String(initialSettings.taxPercent));
  const [codEnabled, setCodEnabled] = useState(initialSettings.codEnabled);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await updateCommerce({
      currencyCode,
      currencySymbol,
      shippingFlatRate: Number(shippingFlatRate) || 0,
      freeShippingThreshold: freeShippingThreshold === "" ? null : Number(freeShippingThreshold),
      taxPercent: Number(taxPercent) || 0,
      codEnabled,
    });

    setIsSubmitting(false);
    if (result.success) {
      toast.success(t("admin.settings.commerceSaved"));
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currency-code">{t("admin.settings.currencyCode")}</Label>
          <Input
            id="currency-code"
            required
            value={currencyCode}
            onChange={(event) => setCurrencyCode(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currency-symbol">{t("admin.settings.currencySymbol")}</Label>
          <Input
            id="currency-symbol"
            required
            value={currencySymbol}
            onChange={(event) => setCurrencySymbol(event.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="shipping-flat-rate">{t("admin.settings.shippingFlatRate")}</Label>
          <Input
            id="shipping-flat-rate"
            type="number"
            min="0"
            step="0.01"
            value={shippingFlatRate}
            onChange={(event) => setShippingFlatRate(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tax-percent">{t("admin.settings.taxPercent")}</Label>
          <Input
            id="tax-percent"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={taxPercent}
            onChange={(event) => setTaxPercent(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="free-shipping-threshold">{t("admin.settings.freeShippingThreshold")}</Label>
        <Input
          id="free-shipping-threshold"
          type="number"
          min="0"
          step="0.01"
          value={freeShippingThreshold}
          onChange={(event) => setFreeShippingThreshold(event.target.value)}
        />
        <p className="text-sm text-muted-foreground">{t("admin.settings.freeShippingThresholdHint")}</p>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="cod-enabled"
          checked={codEnabled}
          onCheckedChange={(value) => setCodEnabled(value === true)}
        />
        <Label htmlFor="cod-enabled">{t("admin.settings.codEnabled")}</Label>
      </div>

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {t("admin.settings.saveCommerce")}
      </Button>
    </form>
  );
}
