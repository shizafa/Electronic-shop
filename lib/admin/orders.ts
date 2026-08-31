import "server-only";
import { requireAdmin } from "@/lib/actions/admin/guard";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ORDER_SELECT, mapOrderRow, type OrderRow } from "@/lib/orders";
import type { Order, OrderStatus } from "@/types/order";

// Admin-scoped order reads — unlike lib/orders.ts's getOrdersForUser/getOrderById, these
// aren't limited to the caller's own orders. Relies on the orders_select_admin RLS policy
// (is_admin(auth.uid())), so the cookie-bound server client is sufficient here — no need
// for the service-role client.

export async function getAllOrders(filters?: { status?: OrderStatus }): Promise<Order[]> {
  const supabase = await createClient();
  let query = supabase.from("orders").select(ORDER_SELECT).order("placed_at", { ascending: false });
  if (filters?.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) {
    console.error("getAllOrders failed", error);
    return [];
  }
  return (data ?? []).map((row) => mapOrderRow(row as unknown as OrderRow));
}

export async function getOrderByIdAdmin(orderId: string): Promise<Order | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("orders").select(ORDER_SELECT).eq("id", orderId).maybeSingle();
  if (error) {
    console.error("getOrderByIdAdmin failed", error);
    return undefined;
  }
  return data ? mapOrderRow(data as unknown as OrderRow) : undefined;
}

export interface AdminOrderDetail extends Order {
  customerEmail: string;
}

// Order detail page needs the customer's email, which lives on auth.users, not the orders/
// profiles tables — only reachable via the service-role client (same reason as
// lib/admin/customers.ts's getCustomerById). requireAdmin() guards this extra service-role
// call; the underlying order read still goes through the RLS-scoped getOrderByIdAdmin.
export async function getOrderDetailForAdmin(orderId: string): Promise<AdminOrderDetail | undefined> {
  const guard = await requireAdmin();
  if (!guard.ok) return undefined;

  const order = await getOrderByIdAdmin(orderId);
  if (!order) return undefined;

  const admin = createAdminClient();
  const { data: authUser } = await admin.auth.admin.getUserById(order.userId);

  return { ...order, customerEmail: authUser.user?.email ?? "" };
}

export async function getOrdersForCustomer(userId: string): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("user_id", userId)
    .order("placed_at", { ascending: false });
  if (error) {
    console.error("getOrdersForCustomer failed", error);
    return [];
  }
  return (data ?? []).map((row) => mapOrderRow(row as unknown as OrderRow));
}
