"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import { getOrdersForUser } from "@/lib/orders";
import type { Order } from "@/types/order";

// OrderHistory — lists all past orders for the logged-in user, newest first
export function OrderHistory() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);

  useEffect(() => {
    if (!user) return; // nothing to fetch — the render logic below handles the "no user" case

    let active = true;
    getOrdersForUser(user.id).then((result) => {
      if (!active) return;
      // newest first
      setOrders([...result].sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()));
      setIsOrdersLoading(false);
    });

    return () => {
      active = false;
    };
  }, [user]);

  if (isAuthLoading) {
    return <p className="text-sm text-muted-foreground">{t("common.loading")}</p>;
  }

  if (!user) return null;

  if (isOrdersLoading) {
    return <p className="text-sm text-muted-foreground">{t("common.loading")}</p>;
  }

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">{t("account.orders")}</h1>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("account.noOrders")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:border-primary sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {t("account.orderPlacedOn")} {order.placedAt}
                </p>
                <p className="text-xs text-muted-foreground">
                  {order.items.length} {t("common.products")}
                </p>
              </div>

              <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                  {t(`orderStatus.${order.status}`)}
                </span>
                <span className="text-sm font-semibold text-foreground">{formatPrice(order.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
