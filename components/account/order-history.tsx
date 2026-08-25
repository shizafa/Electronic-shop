"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import { getOrdersForUser } from "@/lib/orders";
import type { Order } from "@/types/order";

type Tab = "current" | "unpaid" | "all";

const DONE_STATUSES = new Set(["delivered", "cancelled", "returned_refunded"]);
const UNPAID_STATUSES = new Set(["pending", "cod_pending"]);

const STATUS_COLOR: Record<Order["status"], string> = {
  order_placed: "text-amber-600",
  processing: "text-amber-600",
  ready_for_dispatch: "text-amber-600",
  shipped: "text-primary",
  out_for_delivery: "text-primary",
  delivered: "text-emerald-600",
  cancelled: "text-destructive",
  return_requested: "text-amber-600",
  returned_refunded: "text-destructive",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

// OrderHistory — lists the logged-in user's orders, filterable by Current/Unpaid/All
export function OrderHistory() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("current");

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

  const visibleOrders = orders.filter((order) => {
    if (tab === "current") return !DONE_STATUSES.has(order.status);
    if (tab === "unpaid") return UNPAID_STATUSES.has(order.paymentStatus);
    return true;
  });

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div className="flex items-center gap-1 rounded-lg border border-border p-1 w-fit">
        {(["current", "unpaid", "all"] as Tab[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t(`account.ordersTab.${value}`)}
          </button>
        ))}
      </div>

      {visibleOrders.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("account.noOrders")}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {visibleOrders.map((order) => (
            <div key={order.id} className="rounded-xl border border-border p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="text-lg font-semibold text-foreground hover:underline"
                  >
                    {t("account.orderNumber")} {order.orderNumber}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {order.items.length} {t("common.products").toLowerCase()} · {user.name} ·{" "}
                    {formatDateTime(order.placedAt)}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 border-t border-border pt-4 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-muted-foreground">{t("account.status")}</p>
                  <p className={`font-medium ${STATUS_COLOR[order.status]}`}>{t(`orderStatus.${order.status}`)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">{t("account.deliveredTo")}</p>
                  <p className="font-medium text-foreground">
                    {order.shippingAddress.addressLine}, {order.shippingAddress.area}, {order.shippingAddress.city}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("common.total")}</p>
                  <p className="font-semibold text-foreground">{formatPrice(order.total)}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
                {order.items.map((item) => (
                  <div key={item.variantId} className="flex items-center gap-3">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.image && (
                        <Image src={item.image} alt={item.productName} fill sizes="56px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("common.quantity")}: {item.quantity}x = {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
