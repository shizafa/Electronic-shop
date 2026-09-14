"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createCoupon, updateCoupon } from "@/lib/actions/admin/coupons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { timestampToExpiryDate } from "@/lib/coupon-dates";
import { t } from "@/lib/i18n";
import type { Coupon, CouponType } from "@/types/coupon";

interface CouponFormProps {
  coupon?: Coupon;
}

// Coupon create/edit form — same shape as CategoryForm (Card-wrapped fields, save below).
export function CouponForm({ coupon }: CouponFormProps) {
  const router = useRouter();
  const isEditing = Boolean(coupon);

  const [code, setCode] = useState(coupon?.code ?? "");
  const [type, setType] = useState<CouponType>(coupon?.type ?? "percent");
  const [value, setValue] = useState(coupon ? String(coupon.value) : "");
  const [usageLimit, setUsageLimit] = useState(coupon?.usageLimit != null ? String(coupon.usageLimit) : "");
  const [expiresOn, setExpiresOn] = useState(coupon?.expiresAt ? timestampToExpiryDate(coupon.expiresAt) : "");
  const [isActive, setIsActive] = useState(coupon?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const input = {
      code,
      type,
      value: Number(value),
      usageLimit: usageLimit === "" ? null : Number(usageLimit),
      expiresOn: expiresOn || null,
      isActive,
    };
    const result = isEditing ? await updateCoupon(coupon!.id, input) : await createCoupon(input);

    setIsSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(t("admin.coupons.couponSaved"));
    if (isEditing) router.refresh();
    else router.push(`/admin/coupons/${result.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/coupons"
          className="flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t("admin.coupons.backToCoupons")}
        </Link>
        <h2 className="text-xl font-semibold text-foreground">
          {isEditing ? coupon!.code : t("admin.coupons.newCoupon")}
        </h2>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="coupon-code">{t("admin.coupons.code")}</Label>
            <Input
              id="coupon-code"
              required
              maxLength={32}
              pattern="[A-Za-z0-9_\-]{3,32}"
              className="font-mono uppercase"
              aria-describedby="coupon-code-hint"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
            />
            <p id="coupon-code-hint" className="text-xs text-muted-foreground">
              {t("admin.coupons.codeHint")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="coupon-type">{t("admin.coupons.type")}</Label>
              <Select value={type} onValueChange={(next) => setType(next as CouponType)}>
                <SelectTrigger id="coupon-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">{t("admin.coupons.typePercent")} (%)</SelectItem>
                  <SelectItem value="flat">
                    {t("admin.coupons.typeFlat")} ({t("admin.settings.rupeePrefix")})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="coupon-value">{t("admin.coupons.value")}</Label>
              <div className="relative">
                {type === "flat" && (
                  <span className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {t("admin.settings.rupeePrefix")}
                  </span>
                )}
                <Input
                  id="coupon-value"
                  type="number"
                  required
                  min="0.01"
                  max={type === "percent" ? "100" : undefined}
                  step="0.01"
                  className={type === "flat" ? "ps-9" : "pe-7"}
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                />
                {type === "percent" && (
                  <span className="pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="coupon-usage-limit">{t("admin.coupons.usageLimit")}</Label>
              <Input
                id="coupon-usage-limit"
                type="number"
                min="1"
                step="1"
                placeholder={t("admin.coupons.unlimited")}
                aria-describedby="coupon-usage-limit-hint"
                value={usageLimit}
                onChange={(event) => setUsageLimit(event.target.value)}
              />
              <p id="coupon-usage-limit-hint" className="text-xs text-muted-foreground">
                {t("admin.coupons.usageLimitHint")}
                {isEditing && (
                  <>
                    {" "}
                    {t("admin.coupons.usedTimes")}: {coupon!.usedCount}.
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="coupon-expiry">{t("admin.coupons.expiryDate")}</Label>
              <Input
                id="coupon-expiry"
                type="date"
                aria-describedby="coupon-expiry-hint"
                value={expiresOn}
                onChange={(event) => setExpiresOn(event.target.value)}
              />
              <p id="coupon-expiry-hint" className="text-xs text-muted-foreground">
                {t("admin.coupons.expiryHint")}
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox checked={isActive} onCheckedChange={(checked) => setIsActive(checked === true)} />
            {t("admin.coupons.isActive")}
          </label>
        </CardContent>
      </Card>

      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isEditing ? t("admin.coupons.saveCoupon") : t("admin.coupons.createCoupon")}
        </Button>
      </div>
    </form>
  );
}
