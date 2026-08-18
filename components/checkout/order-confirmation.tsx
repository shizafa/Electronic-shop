"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import { getOrderById } from "@/lib/orders";
import type { Order } from "@/types/order";

// OrderConfirmation — final "thank you" screen shown after an order is placed, read from the orderId URL param
export function OrderConfirmation() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";
  const [order, setOrder] = useState<Order | null | undefined>(undefined); // undefined = still loading

  useEffect(() => {
    if (!orderId) return; // no id in the URL — the render logic below treats that as "not found"

    let active = true;
    getOrderById(orderId).then((result) => {
      if (active) setOrder(result ?? null);
    });
    return () => {
      active = false;
    };
  }, [orderId]);

  if (orderId && order === undefined) {
    return (
      <div className="container-page flex flex-col items-center gap-3 py-16 text-center text-sm text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">{t("checkout.orderNotFound")}</p>
        <Button asChild>
          <Link href="/">{t("common.continueShopping")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page flex flex-col items-center gap-3 py-16 text-center">
      <CheckCircle2 className="size-12 text-primary" />
      <h1 className="text-2xl font-semibold sm:text-3xl">{t("checkout.confirmationHeading")}</h1>
      <p className="max-w-md text-sm text-muted-foreground">{t("checkout.confirmationMessage")}</p>

      <div className="mt-4 rounded-lg border border-border px-4 py-3 text-sm">
        <span className="text-muted-foreground">{t("checkout.orderNumber")}: </span>
        <span className="font-medium text-foreground">{order.orderNumber}</span>
      </div>

      <p className="text-lg font-semibold text-foreground">{formatPrice(order.total)}</p>

      <div className="mt-4 flex gap-3">
        <Button asChild>
          <Link href={`/account/orders/${order.id}`}>{t("checkout.viewOrder")}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">{t("common.continueShopping")}</Link>
        </Button>
      </div>
    </div>
  );
}