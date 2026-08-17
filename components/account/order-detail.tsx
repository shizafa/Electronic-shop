"use client";

import Image from "next/image";
import { notFound } from "next/navigation";
import { StatusTimeline } from "@/components/order/status-timeline";
import { useAuth } from "@/context/auth-context";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import { getOrderById } from "@/lib/orders";

export function OrderDetail({ orderId }: { orderId: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container-page py-12 text-sm text-muted-foreground">{t("common.loading")}</div>
    );
  }

  const order = getOrderById(orderId);

  if (!order || !user || order.userId !== user.id) {
    notFound();
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{order.orderNumber}</h1>
        <p className="text-sm text-muted-foreground">
          {t("account.orderPlacedOn")} {order.placedAt}
        </p>
      </div>

      <div className="rounded-lg border border-border p-4">
        <StatusTimeline order={order} />
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground">{t("checkout.itemsInOrder")}</p>
        <div className="mt-3 flex flex-col divide-y divide-border">
          {order.items.map((item) => (
            <div key={item.variantId} className="flex items-center gap-3 py-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image src={item.image} alt={item.productName} fill sizes="56px" className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {t("product.sku")}: {item.sku} · {t("common.quantity")}: {item.quantity}
                </p>
              </div>
              <p className="text-sm font-medium text-foreground">
                {formatPrice(item.unitPrice * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{t("checkout.shippingAddress")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.shippingAddress.fullName} · {order.shippingAddress.phone}
            <br />
            {order.shippingAddress.addressLine}, {order.shippingAddress.area}, {order.shippingAddress.city}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">{t("checkout.billingAddress")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.billingAddress.fullName} · {order.billingAddress.phone}
            <br />
            {order.billingAddress.addressLine}, {order.billingAddress.area}, {order.billingAddress.city}
          </p>
        </div>
      </div>

      {order.installation && (
        <div>
          <p className="text-sm font-semibold text-foreground">{t("checkout.installationSchedule")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.installation.date} · {order.installation.timeSlot}
          </p>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-foreground">{t("checkout.paymentMethod")}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(`paymentMethod.${order.paymentMethod}`)} · {t(`paymentStatus.${order.paymentStatus}`)}
        </p>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>{t("common.subtotal")}</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>{t("common.shippingFee")}</span>
          <span>{order.shippingFee === 0 ? t("common.free") : formatPrice(order.shippingFee)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
          <span>{t("common.total")}</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}