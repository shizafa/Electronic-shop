import { Badge } from "@/components/ui/badge";
import { t } from "@/lib/i18n";
import type { OrderStatus } from "@/types/order";

// Status color carries identity via a small dot, never via the text itself (text stays in
// the badge's normal ink) — some status hues (e.g. warning) don't clear text contrast on
// their own, and color should never be the only signal anyway.
const DOT_CLASS_BY_STATUS: Record<OrderStatus, string> = {
  order_placed: "bg-chart-1",
  processing: "bg-chart-1",
  ready_for_dispatch: "bg-chart-1",
  shipped: "bg-chart-1",
  out_for_delivery: "bg-chart-1",
  delivered: "bg-status-good",
  cancelled: "bg-status-critical",
  return_requested: "bg-status-warning",
  returned_refunded: "bg-status-critical",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="outline" className="gap-1.5">
      <span className={`size-1.5 shrink-0 rounded-full ${DOT_CLASS_BY_STATUS[status]}`} />
      {t(`orderStatus.${status}`)}
    </Badge>
  );
}
