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

// Real rbt-badge-bg-* classes style.min.css defines (confirmed: danger, disabled, green,
// warning) — statuses are bucketed into these four rather than inventing new badge colors.
const STATUS_BADGE_CLASS: Record<Order["status"], string> = {
  order_placed: "rbt-badge-bg-warning",
  processing: "rbt-badge-bg-warning",
  ready_for_dispatch: "rbt-badge-bg-warning",
  shipped: "rbt-badge-bg-warning",
  out_for_delivery: "rbt-badge-bg-warning",
  delivered: "rbt-badge-bg-green",
  cancelled: "rbt-badge-bg-danger",
  return_requested: "rbt-badge-bg-warning",
  returned_refunded: "rbt-badge-bg-danger",
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

// OrderHistory — "My Orders" panel for /account/orders, wrapped by app/(site)/account/layout.tsx's
// shell (breadcrumb + sidebar), same rbt-profile-content-area / rbt-single-info block pattern
// profile.tsx uses for its own panels. The Current/Unpaid/All switcher reuses the fast-filter pill
// pattern from shop-toolbar.tsx (.rbt-tag-list.rbt-tag-list-rounded.rbt-tag-list-var-one, active
// class toggled by state instead of a real filter), and each order's item rows reuse
// cart-view.tsx's .cart-product-card thumbnail+name+sku layout minus its remove button.
export function OrderHistory() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState<Tab>("current");

  useEffect(() => {
    if (!user) return; // nothing to fetch — the render logic below handles the "no user" case

    let active = true;
    getOrdersForUser(user.id)
      .then((result) => {
        if (!active) return;
        // newest first
        setOrders([...result].sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()));
        setIsOrdersLoading(false);
      })
      .catch((error) => {
        console.error(error);
        if (!active) return;
        setLoadError(true);
        setIsOrdersLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (isAuthLoading || !user) {
    return (
      <div className="rbt-profile-content-area">
        <p className="b1 mb--0">{t("common.loading")}</p>
      </div>
    );
  }

  if (isOrdersLoading) {
    return (
      <div className="rbt-profile-content-area">
        <p className="b1 mb--0">{t("common.loading")}</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rbt-profile-content-area">
        <p className="b1 mb--0">{t("common.loadFailed")}</p>
      </div>
    );
  }

  const visibleOrders = orders.filter((order) => {
    if (tab === "current") return !DONE_STATUSES.has(order.status);
    if (tab === "unpaid") return UNPAID_STATUSES.has(order.paymentStatus);
    return true;
  });

  return (
    <div className="rbt-profile-content-area">
      <div className="row row--12 mt_dec--24">
        <div className="col-12 mt--24">
          <div className="rbt-component-section-title rbt-gap--4 mb--0 p-0 border-0">
            <h2 className="rbt-title mb--0">
              <span className="rbt-text-bold">
                {t("account.orders")}
              </span>
            </h2>
          </div>
        </div>
      </div>
      <hr className="mt--20 mb--16" />

      <div className="rbt-shop-filter-tag-list rbt-tag-list rbt-tag-list-rounded rbt-tag-list-var-one mb--24">
        {(["current", "unpaid", "all"] as Tab[]).map((value) => (
          <a
            key={value}
            href="#"
            className={tab === value ? "active" : undefined}
            onClick={(event) => {
              event.preventDefault();
              setTab(value);
            }}
          >
            {t(`account.ordersTab.${value}`)}
          </a>
        ))}
      </div>

      {visibleOrders.length === 0 ? (
        <p className="b1 mb--0">
          {t("account.noOrders")}
        </p>
      ) : (
        <div className="rbt-scrollable-content hide-scrollbar">
          {visibleOrders.map((order) => (
            <div key={order.id} className="rbt-single-info mb--24">
              <div className="rbt-single-info-header d-flex justify-content-between align-items-center flex-wrap rbt-gap--8 mb--12 pt--4">
                <div>
                  <Link href={`/account/orders/${order.id}`} className="h6 mb--0 d-block">
                    {t("account.orderNumber")}
                    {order.orderNumber}
                  </Link>
                  <p className="b4 rbt-text-color-gray-600 mb--0">
                    {order.items.length} {t("common.products").toLowerCase()} · {formatDateTime(order.placedAt)}
                  </p>
                </div>
                <span
                  className={`rbt-badge rbt-badge-border rbt-badge-small rbt-badge-rounded ${STATUS_BADGE_CLASS[order.status]}`}
                >
                  {t(`orderStatus.${order.status}`)}
                </span>
              </div>

              <div className="d-flex flex-column rbt-gap--12 mb--16">
                {order.items.map((item) => (
                  <div key={item.variantId} className="cart-product-card">
                    <div className="product-thumbnail">
                      {item.image && (
                        <Image src={item.image} alt={item.productName} width={80} height={61} />
                      )}
                    </div>
                    <div className="d-flex flex-column">
                      <h3 className="rbt-wish-product-name h6 mb--4">
                        {item.productName}
                      </h3>
                      <span className="rbt-product-id">
                        <span className="rbt-text-semi-bold">
                          {t("common.quantity")}:
                        </span>
                        {item.quantity} × {formatPrice(item.unitPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="b4 rbt-text-color-gray-600 mb--4">
                {t("account.deliveredTo")}
              </p>
              <p className="b1 mb--12">
                {order.shippingAddress.addressLine}, {order.shippingAddress.area}, {order.shippingAddress.city}
              </p>

              <hr className="mb--8 mt--8 rbt-bg-color-gray-200" />
              <div className="rbt-cart-subttotal mb--0">
                <p className="subtotal">
                  <strong>
                    {t("common.total")}
                  </strong>
                </p>
                <p className="price">
                  {formatPrice(order.total)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
