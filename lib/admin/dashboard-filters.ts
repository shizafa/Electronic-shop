// Client-safe (no "server-only") aggregation helpers for the admin overview's interactive
// widgets. Unlike lib/admin/dashboard.ts's server-only queries, these operate on an already-
// fetched Order[] (from getAllOrders(), passed down from the Overview server component) so
// each widget can re-filter/re-aggregate locally as the admin changes its period/category
// filter, without a network round-trip per interaction.

import {
  differenceInCalendarDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfDay,
  format,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import type { Order } from "@/types/order";

export type DashboardPeriod = "week" | "month" | "year" | "custom";

export interface DateRange {
  start: Date;
  end: Date;
}

export type ChartGranularity = "day" | "month";

// Resolves a period choice into a concrete date range + the granularity its chart should use.
// Week/Month use daily points so the trend within that short window is visible; Year keeps
// monthly points; Custom picks daily vs monthly based on how wide the chosen range is.
export function getPeriodRange(period: DashboardPeriod, custom: DateRange | undefined, now = new Date()): {
  range: DateRange;
  granularity: ChartGranularity;
} {
  switch (period) {
    case "week":
      return { range: { start: startOfDay(subDays(now, 6)), end: endOfDay(now) }, granularity: "day" };
    case "month":
      return { range: { start: startOfDay(subDays(now, 29)), end: endOfDay(now) }, granularity: "day" };
    case "custom": {
      if (!custom) return { range: { start: startOfDay(now), end: endOfDay(now) }, granularity: "day" };
      const range = { start: startOfDay(custom.start), end: endOfDay(custom.end) };
      const spanDays = differenceInCalendarDays(range.end, range.start);
      return { range, granularity: spanDays > 62 ? "month" : "day" };
    }
    case "year":
    default:
      return { range: { start: startOfMonth(subMonths(now, 11)), end: endOfDay(now) }, granularity: "month" };
  }
}

export interface RevenueSeriesPoint {
  key: string;
  label: string;
  revenue: number;
}

// Sums order totals into daily or monthly buckets across the range, seeding every bucket with
// 0 first so the chart shows gaps rather than missing points.
export function buildRevenueSeries(orders: Order[], range: DateRange, granularity: ChartGranularity): RevenueSeriesPoint[] {
  const buckets =
    granularity === "day"
      ? eachDayOfInterval(range).map((date) => ({ key: format(date, "yyyy-MM-dd"), label: format(date, "MMM d") }))
      : eachMonthOfInterval(range).map((date) => ({ key: format(date, "yyyy-MM"), label: format(date, "MMM yy") }));

  const revenueByKey = new Map(buckets.map((bucket) => [bucket.key, 0]));

  for (const order of orders) {
    const placedAt = new Date(order.placedAt);
    if (!isWithinInterval(placedAt, range)) continue;
    const key = format(placedAt, granularity === "day" ? "yyyy-MM-dd" : "yyyy-MM");
    if (revenueByKey.has(key)) revenueByKey.set(key, (revenueByKey.get(key) ?? 0) + order.total);
  }

  return buckets.map((bucket) => ({ ...bucket, revenue: revenueByKey.get(bucket.key) ?? 0 }));
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

export function buildOrderStatusBreakdown(orders: Order[], range: DateRange): OrderStatusBreakdownEntry[] {
  const countByBucket: Record<OrderStatusBucket, number> = {
    delivered: 0,
    in_progress: 0,
    cancelled: 0,
    returned: 0,
  };

  for (const order of orders) {
    if (!isWithinInterval(new Date(order.placedAt), range)) continue;
    const bucket = BUCKET_BY_STATUS[order.status];
    if (bucket) countByBucket[bucket] += 1;
  }

  return (Object.entries(countByBucket) as [OrderStatusBucket, number][]).map(([bucket, count]) => ({
    bucket,
    count,
  }));
}

export interface TopProductEntry {
  productId: string;
  name: string;
  image: string | null;
  revenue: number;
  share: number; // 0-1, of total revenue across products in the current (possibly category-filtered) result
}

// Every category name that has at least one non-cancelled order item, for the Top Products
// category filter dropdown. Derived from order history itself (via each item's categoryName
// snapshot) rather than the live categories table, so it only lists categories that actually
// sold something.
export function getAvailableCategoryNames(orders: Order[]): string[] {
  const names = new Set<string>();
  for (const order of orders) {
    if (order.status === "cancelled") continue;
    for (const item of order.items) names.add(item.categoryName);
  }
  return Array.from(names).sort((a, b) => a.localeCompare(b));
}

// Top products by revenue, optionally narrowed to one category (matched by the order item's
// categoryName snapshot). Excludes cancelled orders' items — they were never actually sold.
export function buildTopProducts(orders: Order[], categoryName: string | "all", limit = 5): TopProductEntry[] {
  const revenueByProduct = new Map<string, { name: string; image: string | null; revenue: number }>();

  for (const order of orders) {
    if (order.status === "cancelled") continue;
    for (const item of order.items) {
      if (categoryName !== "all" && item.categoryName !== categoryName) continue;
      const revenue = item.unitPrice * item.quantity;
      const existing = revenueByProduct.get(item.productId);
      if (existing) {
        existing.revenue += revenue;
      } else {
        revenueByProduct.set(item.productId, { name: item.productName, image: item.image, revenue });
      }
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
