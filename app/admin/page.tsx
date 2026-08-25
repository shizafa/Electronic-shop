import { OrdersTable } from "@/components/admin/orders/orders-table";
import { OrderStatusChart } from "@/components/admin/overview/order-status-chart";
import { RevenueChart } from "@/components/admin/overview/revenue-chart";
import { SalesTargetGauge } from "@/components/admin/overview/sales-target-gauge";
import { StatCards } from "@/components/admin/overview/stat-cards";
import { TopProducts } from "@/components/admin/overview/top-products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats, getRevenueForPeriod } from "@/lib/admin/dashboard";
import { getAllOrders } from "@/lib/admin/orders";
import { getSalesTargets } from "@/lib/admin/settings";
import { t } from "@/lib/i18n";

export default async function AdminOverviewPage() {
  const [stats, targets, weekRevenue, monthRevenue, orders] = await Promise.all([
    getDashboardStats(),
    getSalesTargets(),
    getRevenueForPeriod("week"),
    getRevenueForPeriod("month"),
    getAllOrders(),
  ]);

  const recentOrders = orders.slice(0, 8);

  return (
    <div className="flex flex-col gap-4">
      <StatCards stats={stats} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart orders={orders} />
        </div>
        <OrderStatusChart orders={orders} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopProducts orders={orders} />
        </div>
        <SalesTargetGauge targets={targets} weekRevenue={weekRevenue} monthRevenue={monthRevenue} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.overview.recentOrders")}</CardTitle>
        </CardHeader>
        <CardContent>
          <OrdersTable orders={recentOrders} />
        </CardContent>
      </Card>
    </div>
  );
}
