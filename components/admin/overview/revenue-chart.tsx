"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import type { MonthlyRevenuePoint } from "@/lib/admin/dashboard";

const chartConfig = {
  revenue: {
    label: t("admin.overview.totalRevenue"),
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(Date.UTC(year, monthNumber - 1, 1)).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

export function RevenueChart({ data }: { data: MonthlyRevenuePoint[] }) {
  const hasData = data.some((point) => point.revenue > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.overview.salesStatistics")}</CardTitle>
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
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatMonthLabel}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => formatMonthLabel(String(value))}
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
