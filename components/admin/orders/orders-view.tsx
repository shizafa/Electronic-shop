"use client";

import { useMemo, useState } from "react";
import { OrdersTable } from "@/components/admin/orders/orders-table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { t } from "@/lib/i18n";
import type { Order, OrderStatus } from "@/types/order";

const STATUS_OPTIONS: OrderStatus[] = [
  "order_placed",
  "processing",
  "ready_for_dispatch",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "return_requested",
  "returned_refunded",
];

interface OrdersViewProps {
  orders: Order[];
}

// Client-side status filter + order-number search over an already-fetched order list —
// matches the storefront's own filter pattern (see CategoryListing) rather than
// round-tripping to the server for every filter change; fine at this shop's scale.
export function OrdersView({ orders }: OrdersViewProps) {
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [query, setQuery] = useState("");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (status !== "all" && order.status !== status) return false;
      if (query && !order.orderNumber.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });
  }, [orders, status, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("admin.orders.searchPlaceholder")}
          className="sm:max-w-xs"
        />
        <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus | "all")}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("admin.orders.allStatuses")}</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {t(`orderStatus.${option}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <OrdersTable orders={filteredOrders} />
    </div>
  );
}
