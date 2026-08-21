"use client";

import { useState } from "react";
import Link from "next/link";
import { RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import type { SalesTargets } from "@/lib/admin/settings";

interface SalesTargetGaugeProps {
  targets: SalesTargets;
  weekRevenue: number;
  monthRevenue: number;
}

const chartConfig = { progress: { label: t("admin.overview.salesTarget") } } satisfies ChartConfig;

export function SalesTargetGauge({ targets, weekRevenue, monthRevenue }: SalesTargetGaugeProps) {
  const [period, setPeriod] = useState<"week" | "month">("week");

  const target = period === "week" ? targets.weeklyTarget : targets.monthlyTarget;
  const revenue = period === "week" ? weekRevenue : monthRevenue;
  const percent = target > 0 ? Math.min(revenue / target, 1) * 100 : 0;
  const isMet = target > 0 && revenue >= target;

  const chartData = [{ name: "progress", value: percent, fill: isMet ? "var(--status-good)" : "var(--chart-1)" }];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{t("admin.overview.salesTarget")}</CardTitle>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant={period === "week" ? "default" : "ghost"}
            onClick={() => setPeriod("week")}
          >
            {t("admin.overview.thisWeek")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={period === "month" ? "default" : "ghost"}
            onClick={() => setPeriod("month")}
          >
            {t("admin.overview.thisMonth")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {target > 0 ? (
          <div className="flex flex-col items-center">
            <ChartContainer config={chartConfig} className="mx-auto aspect-square h-48">
              <RadialBarChart data={chartData} startAngle={90} endAngle={-270} innerRadius="70%" outerRadius="100%">
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
                <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "var(--muted)" }} />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-2xl font-semibold">
                  {Math.round(percent)}%
                </text>
              </RadialBarChart>
            </ChartContainer>
            <p className="text-sm text-muted-foreground">
              {formatPrice(revenue)} / {formatPrice(target)}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-muted-foreground">{t("admin.overview.setTarget")}</p>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/settings">{t("admin.nav.settings")}</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
