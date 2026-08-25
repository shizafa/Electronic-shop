"use client";

import { useMemo, useState } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { PeriodFilter } from "@/components/admin/overview/period-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { buildOrderStatusBreakdown, getPeriodRange, type DashboardPeriod, type DateRange } from "@/lib/admin/dashboard-filters";
import { t } from "@/lib/i18n";
import type { Order } from "@/types/order";

// Order status is genuine state (good/warning/critical outcomes), not arbitrary series
// identity, so this reuses the reserved status palette rather than the categorical one —
// "in progress" isn't an alarm state, so it gets a neutral categorical blue instead.
const chartConfig = {
  delivered: { label: t("admin.orderStatusBucket.delivered"), color: "var(--status-good)" },
  in_progress: { label: t("admin.orderStatusBucket.in_progress"), color: "var(--chart-1)" },
  returned: { label: t("admin.orderStatusBucket.returned"), color: "var(--status-warning)" },
  cancelled: { label: t("admin.orderStatusBucket.cancelled"), color: "var(--status-critical)" },
} satisfies ChartConfig;

export function OrderStatusChart({ orders }: { orders: Order[] }) {
  const [period, setPeriod] = useState<DashboardPeriod>("year");
  const [customRange, setCustomRange] = useState<DateRange>();

  const { range } = useMemo(() => getPeriodRange(period, customRange), [period, customRange]);
  const data = useMemo(() => buildOrderStatusBreakdown(orders, range), [orders, range]);

  const total = data.reduce((sum, entry) => sum + entry.count, 0);
  const chartData = data.map((entry) => ({
    bucket: entry.bucket,
    count: entry.count,
    fill: `var(--color-${entry.bucket})`,
  }));

  return (
    <Card>
      <CardHeader className="flex-col items-start gap-2">
        <CardTitle>{t("admin.overview.orderStatus")}</CardTitle>
        <PeriodFilter
          period={period}
          onPeriodChange={setPeriod}
          customRange={customRange}
          onCustomRangeChange={setCustomRange}
        />
      </CardHeader>
      <CardContent>
        {total > 0 ? (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square h-64">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="bucket" hideLabel />} />
              <Pie data={chartData} dataKey="count" nameKey="bucket" innerRadius={55} strokeWidth={2}>
                {chartData.map((entry) => (
                  <Cell key={entry.bucket} fill={entry.fill} stroke="var(--card)" />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="bucket" />} />
            </PieChart>
          </ChartContainer>
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">{t("admin.overview.noData")}</p>
        )}
      </CardContent>
    </Card>
  );
}
