import Link from "next/link";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import type { Order } from "@/types/order";

interface OrdersTableProps {
  orders: Order[];
}

// Read-only orders listing, reused by the Orders list page, the Overview page's
// "Recent Orders" widget, and a customer's order history.
export function OrdersTable({ orders }: OrdersTableProps) {
  if (orders.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("admin.orders.noOrders")}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("admin.orders.order")}</TableHead>
          <TableHead>{t("admin.orders.customer")}</TableHead>
          <TableHead>{t("admin.orders.date")}</TableHead>
          <TableHead>{t("admin.orders.status")}</TableHead>
          <TableHead>{t("admin.orders.payment")}</TableHead>
          <TableHead className="text-end">{t("admin.orders.total")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id} className="cursor-pointer">
            <TableCell className="font-medium">
              <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                {order.orderNumber}
              </Link>
            </TableCell>
            <TableCell>{order.shippingAddress.fullName}</TableCell>
            <TableCell className="text-muted-foreground">{order.placedAt}</TableCell>
            <TableCell>
              <OrderStatusBadge status={order.status} />
            </TableCell>
            <TableCell className="text-muted-foreground">{t(`paymentStatus.${order.paymentStatus}`)}</TableCell>
            <TableCell className="text-end">{formatPrice(order.total)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
