"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { updateSalesTargets } from "@/lib/actions/admin/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "@/lib/i18n";
import type { SalesTargets } from "@/lib/admin/settings";

export function SalesTargetsForm({ initialTargets }: { initialTargets: SalesTargets }) {
  const [weeklyTarget, setWeeklyTarget] = useState(String(initialTargets.weeklyTarget));
  const [monthlyTarget, setMonthlyTarget] = useState(String(initialTargets.monthlyTarget));
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await updateSalesTargets({
      weeklyTarget: Number(weeklyTarget) || 0,
      monthlyTarget: Number(monthlyTarget) || 0,
    });

    setIsSubmitting(false);
    if (result.success) {
      toast.success(t("admin.settings.saved"));
    } else {
      toast.error(t("admin.settings.saveFailed"));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">{t("admin.settings.salesTargets")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("admin.settings.salesTargetsHint")}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="weekly-target">{t("admin.settings.weeklyTarget")}</Label>
        <Input
          id="weekly-target"
          type="number"
          min="0"
          step="1"
          value={weeklyTarget}
          onChange={(event) => setWeeklyTarget(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="monthly-target">{t("admin.settings.monthlyTarget")}</Label>
        <Input
          id="monthly-target"
          type="number"
          min="0"
          step="1"
          value={monthlyTarget}
          onChange={(event) => setMonthlyTarget(event.target.value)}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {t("admin.settings.saveTargets")}
      </Button>
    </form>
  );
}
