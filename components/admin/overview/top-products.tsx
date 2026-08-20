import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import type { TopProduct } from "@/lib/admin/dashboard";

// Plain styled bars rather than a chart component — a single magnitude per row reads fine
// without axes/tooltips, and it's the storefront's own convention for lightweight widgets.
export function TopProducts({ products }: { products: TopProduct[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.overview.topProducts")}</CardTitle>
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
