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

export interface MonthlyRevenuePoint {
  month: string; // "2026-01"
  revenue: number;
}

export async function getMonthlyRevenueSeries(months = 12): Promise<MonthlyRevenuePoint[]> {
  const supabase = await createClient();

  const now = new Date();
  const rangeStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1));

  const { data, error } = await supabase
    .from("orders")
    .select("total, placed_at")
    .gte("placed_at", rangeStart.toISOString());
  if (error) {
    console.error("getMonthlyRevenueSeries failed", error);
    return [];
  }

  // seed every month in the range with 0 so the chart shows gaps, not missing points
  const revenueByMonth = new Map<string, number>();
  for (let i = 0; i < months; i++) {
    const date = new Date(Date.UTC(rangeStart.getUTCFullYear(), rangeStart.getUTCMonth() + i, 1));
    revenueByMonth.set(monthKey(date), 0);
  }

  for (const order of data ?? []) {
    const key = order.placed_at.slice(0, 7);
    if (revenueByMonth.has(key)) {
      revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + Number(order.total));
    }
  }

  return Array.from(revenueByMonth.entries()).map(([month, revenue]) => ({ month, revenue }));
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export type OrderStatusBucket = "delivered" | "in_progress" | "cancelled" | "returned";

export interface OrderStatusBreakdownEntry {
  bucket: OrderStatusBucket;
  count: number;
}

const BUCKET_BY_STATUS: Record<string, OrderStatusBucket> = {
  order_placed: "in_progress",
  processing: "in_progress",
  ready_for_dispatch: "in_progress",
  shipped: "in_progress",
  out_for_delivery: "in_progress",
  delivered: "delivered",
  cancelled: "cancelled",
  return_requested: "returned",
  returned_refunded: "returned",
};

export async function getOrderStatusBreakdown(): Promise<OrderStatusBreakdownEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("orders").select("status");
  if (error) {
    console.error("getOrderStatusBreakdown failed", error);
    return [];
  }

  const countByBucket: Record<OrderStatusBucket, number> = {
    delivered: 0,
    in_progress: 0,
    cancelled: 0,
    returned: 0,
  };
  for (const order of data ?? []) {
    const bucket = BUCKET_BY_STATUS[order.status];
    if (bucket) countByBucket[bucket] += 1;
  }

  return (Object.entries(countByBucket) as [OrderStatusBucket, number][]).map(([bucket, count]) => ({
    bucket,
    count,
  }));
}

export interface TopProduct {
  productId: string;
  name: string;
  image: string | null;
  revenue: number;
  share: number; // 0-1, of total revenue across all products in the result set
}

interface OrderItemRevenueRow {
  product_id: string;
  product_name: string;
  image: string | null;
  unit_price: string | number;
  quantity: number;
}

export async function getTopProductsByRevenue(limit = 5): Promise<TopProduct[]> {
  const supabase = await createClient();
  // Exclude cancelled orders' items — they were never actually sold.
  const { data, error } = await supabase
    .from("order_items")
    .select("product_id, product_name, image, unit_price, quantity, orders!inner(status)")
    .neq("orders.status", "cancelled");
  if (error) {
    console.error("getTopProductsByRevenue failed", error);
    return [];
  }

  const revenueByProduct = new Map<string, { name: string; image: string | null; revenue: number }>();
  for (const row of (data ?? []) as unknown as OrderItemRevenueRow[]) {
    const existing = revenueByProduct.get(row.product_id);
    const revenue = Number(row.unit_price) * row.quantity;
    if (existing) {
      existing.revenue += revenue;
    } else {
      revenueByProduct.set(row.product_id, { name: row.product_name, image: row.image, revenue });
    }
  }

  const totalRevenue = Array.from(revenueByProduct.values()).reduce((sum, entry) => sum + entry.revenue, 0);

  return Array.from(revenueByProduct.entries())
    .map(([productId, entry]) => ({
      productId,
      name: entry.name,
      image: entry.image,
      revenue: entry.revenue,
      share: totalRevenue > 0 ? entry.revenue / totalRevenue : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
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
