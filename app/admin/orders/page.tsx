import { OrdersView } from "@/components/admin/orders/orders-view";
import { getAllOrders } from "@/lib/admin/orders";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();
  return <OrdersView orders={orders} />;
}
