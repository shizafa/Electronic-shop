import { Wallet, ShoppingCart, Package, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import type { AdminDashboardStats } from "@/lib/admin/dashboard";

interface StatCardsProps {
  stats: AdminDashboardStats;
}

// Tailwind needs literal class strings to generate CSS, so each card's tint is spelled
// out rather than built from a template — can't interpolate `bg-chart-${n}/10`.
const CARDS = [
  {
    labelKey: "admin.overview.totalRevenue",
    icon: Wallet,
    value: (stats: AdminDashboardStats) => formatPrice(stats.totalRevenue),
    iconWrapClassName: "bg-chart-1/15 text-chart-1",
  },
  {
    labelKey: "admin.overview.totalOrders",
    icon: ShoppingCart,
    value: (stats: AdminDashboardStats) => stats.totalOrders.toLocaleString(),
    iconWrapClassName: "bg-chart-2/15 text-chart-2",
  },
  {
    labelKey: "admin.overview.totalProducts",
    icon: Package,
    value: (stats: AdminDashboardStats) => stats.totalProducts.toLocaleString(),
    iconWrapClassName: "bg-chart-3/15 text-chart-3",
  },
  {
    labelKey: "admin.overview.totalCustomers",
    icon: Users,
    value: (stats: AdminDashboardStats) => stats.totalCustomers.toLocaleString(),
    iconWrapClassName: "bg-chart-4/15 text-chart-4",
  },
] as const;

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map((card) => (
        <Card key={card.labelKey}>
          <CardContent className="flex items-center gap-3">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${card.iconWrapClassName}`}>
              <card.icon className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t(card.labelKey)}</p>
              <p className="text-lg font-semibold text-foreground">{card.value(stats)}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
