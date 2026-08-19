import "server-only";
import { createClient } from "@/lib/supabase/server";
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
