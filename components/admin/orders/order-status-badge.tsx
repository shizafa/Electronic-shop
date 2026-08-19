import { Badge } from "@/components/ui/badge";
import { t } from "@/lib/i18n";
import type { OrderStatus } from "@/types/order";

const VARIANT_BY_STATUS: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  order_placed: "secondary",
  processing: "secondary",
  ready_for_dispatch: "secondary",
  shipped: "secondary",
  out_for_delivery: "secondary",
  delivered: "default",
  cancelled: "destructive",
  return_requested: "outline",
  returned_refunded: "destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={VARIANT_BY_STATUS[status]}>{t(`orderStatus.${status}`)}</Badge>;
}
