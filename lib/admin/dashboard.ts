import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AdminDashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
}

const COMPLETED_STATUSES = new Set(["delivered", "cancelled", "returned_refunded"]);

export async function getDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = await createClient();

  const [ordersResult, productsCountResult, customersCountResult] = await Promise.all([
    supabase.from("orders").select("status, total"),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  const orders = ordersResult.data ?? [];
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const pendingOrders = orders.filter((order) => !COMPLETED_STATUSES.has(order.status)).length;

  return {
    totalOrders: orders.length,
    pendingOrders,
    totalRevenue,
    totalProducts: productsCountResult.count ?? 0,
    totalCustomers: customersCountResult.count ?? 0,
  };
}

// Sums order totals placed since the start of the current calendar week (Monday) or month,
// for comparing against the admin-set sales target.
export async function getRevenueForPeriod(period: "week" | "month"): Promise<number> {
  const supabase = await createClient();
  const periodStart = getPeriodStart(period);

  const { data, error } = await supabase.from("orders").select("total").gte("placed_at", periodStart.toISOString());
  if (error) {
    console.error("getRevenueForPeriod failed", error);
    return 0;
  }
  return (data ?? []).reduce((sum, order) => sum + Number(order.total), 0);
}

function getPeriodStart(period: "week" | "month"): Date {
  const now = new Date();
  if (period === "month") {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  }
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceMonday));
}
