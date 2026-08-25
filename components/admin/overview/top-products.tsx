"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildTopProducts, getAvailableCategoryNames } from "@/lib/admin/dashboard-filters";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import type { Order } from "@/types/order";

// Plain styled bars rather than a chart component — a single magnitude per row reads fine
// without axes/tooltips, and it's the storefront's own convention for lightweight widgets.
export function TopProducts({ orders }: { orders: Order[] }) {
  const [categoryName, setCategoryName] = useState<string>("all");

  const categoryNames = useMemo(() => getAvailableCategoryNames(orders), [orders]);
  const products = useMemo(() => buildTopProducts(orders, categoryName), [orders, categoryName]);

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle>{t("admin.overview.topProducts")}</CardTitle>
        <Select value={categoryName} onValueChange={setCategoryName}>
          <SelectTrigger size="sm" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("admin.overview.allCategories")}</SelectItem>
            {categoryNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t("admin.overview.noData")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {products.map((product) => (
              <li key={product.productId}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="truncate font-medium text-foreground">{product.name}</span>
                  <span className="shrink-0 text-muted-foreground">{formatPrice(product.revenue)}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-chart-1"
                    style={{ width: `${Math.max(product.share * 100, 2)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
