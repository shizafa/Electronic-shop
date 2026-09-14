"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { updateCommerce } from "@/lib/actions/admin/settings";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { t } from "@/lib/i18n";
import type { StoreSettings } from "@/lib/settings";

// Locked list so a typo can't break price formatting. An unknown saved code snaps to the
// first option.
const CURRENCY_CODES = ["PKR"];

export function StoreCommerceForm({ initialSettings }: { initialSettings: StoreSettings }) {
  const [currencyCode, setCurrencyCode] = useState(
    CURRENCY_CODES.includes(initialSettings.currencyCode) ? initialSettings.currencyCode : CURRENCY_CODES[0]
  );
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
          <Select value={currencyCode} onValueChange={setCurrencyCode}>
            <SelectTrigger id="currency-code" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_CODES.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <div className="relative">
            <span className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {t("admin.settings.rupeePrefix")}
            </span>
            <Input
              id="shipping-flat-rate"
              type="number"
              min="0"
              step="0.01"
              className="ps-9"
              value={shippingFlatRate}
              onChange={(event) => setShippingFlatRate(event.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tax-percent">{t("admin.settings.taxPercent")}</Label>
          <div className="relative">
            <Input
              id="tax-percent"
              type="number"
              min="0"
              max="100"
              step="0.01"
              className="pe-7"
              value={taxPercent}
              onChange={(event) => setTaxPercent(event.target.value)}
            />
            <span className="pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              %
            </span>
          </div>
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

      {/* Only the methods checkout actually accepts (see AVAILABLE_PAYMENT_METHODS in
          lib/actions/orders.ts). Card has no on/off setting, so it's shown locked on. */}
      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">{t("admin.settings.paymentMethods")}</legend>
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
          <label className="flex cursor-pointer items-start gap-3 p-3">
            <Checkbox
              id="cod-enabled"
              className="mt-0.5"
              checked={codEnabled}
              onCheckedChange={(value) => setCodEnabled(value === true)}
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{t("paymentMethod.cod")}</span>
              <span className="text-sm text-muted-foreground">{t("admin.settings.codEnabled")}</span>
            </span>
          </label>
          <label className="flex items-start gap-3 p-3">
            <Checkbox id="card-enabled" className="mt-0.5" checked disabled />
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{t("paymentMethod.card")}</span>
              <span className="text-sm text-muted-foreground">{t("admin.settings.cardAlwaysOn")}</span>
            </span>
          </label>
        </div>
      </fieldset>

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {t("admin.settings.saveCommerce")}
      </Button>
    </form>
  );
}
