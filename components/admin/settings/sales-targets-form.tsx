"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { updateSalesTargets } from "@/lib/actions/admin/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import type { SalesTargets } from "@/lib/admin/settings";

interface SalesTargetsFormProps {
  initialTargets: SalesTargets;
  weekRevenue: number;
  monthRevenue: number;
}

export function SalesTargetsForm({ initialTargets, weekRevenue, monthRevenue }: SalesTargetsFormProps) {
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
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
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
        <TargetProgress achieved={weekRevenue} target={Number(weeklyTarget) || 0} />
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
        <TargetProgress achieved={monthRevenue} target={Number(monthlyTarget) || 0} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {t("admin.settings.saveTargets")}
      </Button>
    </form>
  );
}

// Progress is measured against the value currently in the input, not the saved one, so typing a
// new target immediately shows what it would mean for this period. Revenue itself is whatever the
// server sent on load — editing the field never refetches it.
function TargetProgress({ achieved, target }: { achieved: number; target: number }) {
  if (target <= 0) {
    return <p className="text-xs text-muted-foreground">{t("admin.settings.noTargetSet")}</p>;
  }

  const ratio = Math.min(achieved / target, 1);
  const percent = Math.round(ratio * 100);
  const isMet = achieved >= target;
  const remaining = Math.max(target - achieved, 0);

  return (
    <div className="mt-1 flex flex-col gap-1">
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        {/* Same two colours the Overview gauge uses, so a met target reads the same in both places. */}
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${ratio * 100}%`, backgroundColor: isMet ? "var(--status-good)" : "var(--chart-1)" }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {t("admin.settings.achieved")} {formatPrice(achieved)} / {formatPrice(target)} · {percent}%
        {isMet ? ` · ${t("admin.settings.targetMet")}` : ` · ${formatPrice(remaining)} ${t("admin.settings.remaining")}`}
      </p>
    </div>
  );
}
