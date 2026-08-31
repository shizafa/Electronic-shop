"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/actions/admin/guard";
import { getOrderByIdAdmin } from "@/lib/admin/orders";
import { isValidStatusTransition } from "@/lib/orders";
import type { OrderStatus } from "@/types/order";

export type UpdateOrderStatusResult = { success: true } | { success: false; error: string };

function revalidateOrderPaths(orderId: string, customerId: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath(`/admin/customers/${customerId}`);
}

// Advances/cancels/returns an order. Re-validates the transition server-side (isValidStatusTransition)
// even though the UI only ever offers actions getOrderStatusActions already approved, since the
// caller's view of the order can be stale. Status update and history insert are two separate
// writes (no RPC/transaction wrapper exists in this project — placeOrder in lib/actions/orders.ts
// follows the same sequential-insert pattern for order_items/order_status_history).
export async function updateOrderStatus(
  orderId: string,
  nextStatus: OrderStatus,
  note?: string
): Promise<UpdateOrderStatusResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const order = await getOrderByIdAdmin(orderId);
  if (!order) return { success: false, error: "Order not found" };

  if (!isValidStatusTransition(order, nextStatus)) {
    return { success: false, error: "That status change isn't allowed from the order's current state" };
  }

  const { error: updateError } = await guard.supabase
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", orderId);
  if (updateError) return { success: false, error: "Failed to update order status" };

  const { error: historyError } = await guard.supabase
    .from("order_status_history")
    .insert({ order_id: orderId, status: nextStatus, note: note?.trim() || null });
  if (historyError) return { success: false, error: "Status was updated, but failed to record history" };

  revalidateOrderPaths(orderId, order.userId);
  return { success: true };
}
