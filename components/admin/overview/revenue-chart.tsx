"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { PeriodFilter } from "@/components/admin/overview/period-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { buildRevenueSeries, getPeriodRange, type DashboardPeriod, type DateRange } from "@/lib/admin/dashboard-filters";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import type { Order } from "@/types/order";

const chartConfig = {
  revenue: {
    label: t("admin.overview.totalRevenue"),
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function RevenueChart({ orders }: { orders: Order[] }) {
  const [period, setPeriod] = useState<DashboardPeriod>("year");
  const [customRange, setCustomRange] = useState<DateRange>();

  const { range, granularity } = useMemo(() => getPeriodRange(period, customRange), [period, customRange]);
  const data = useMemo(() => buildRevenueSeries(orders, range, granularity), [orders, range, granularity]);
  const hasData = data.some((point) => point.revenue > 0);

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle>{t("admin.overview.salesStatistics")}</CardTitle>
        <PeriodFilter
          period={period}
          onPeriodChange={setPeriod}
          customRange={customRange}
          onCustomRangeChange={setCustomRange}
        />
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
            <AreaChart data={data} margin={{ left: 8, right: 8 }}>
              <defs>
                <linearGradient id="admin-revenue-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex flex-1 justify-between gap-4">
                        <span className="text-muted-foreground">{name}</span>
                        <span className="font-mono font-medium text-foreground tabular-nums">
                          {formatPrice(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Area
                dataKey="revenue"
                type="monotone"
                fill="url(#admin-revenue-fill)"
                stroke="var(--color-revenue)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">{t("admin.overview.noData")}</p>
        )}
      </CardContent>
    </Card>
  );
}
