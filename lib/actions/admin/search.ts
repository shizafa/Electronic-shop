"use server";

import { requireAdmin } from "@/lib/actions/admin/guard";
import { getAllCustomers } from "@/lib/admin/customers";

export type AdminSearchResultType = "product" | "order" | "customer";

export interface AdminSearchResult {
  type: AdminSearchResultType;
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  image?: string | null;
}

const RESULTS_PER_TYPE = 5;

// Backs the admin topbar's command palette: searches products (name), orders (order number),
// and customers (name/email) in parallel and returns a flat, capped result list for the
// caller to group by type.
export async function searchAdmin(query: string): Promise<AdminSearchResult[]> {
  const guard = await requireAdmin();
  if (!guard.ok) return [];

  const trimmed = query.trim();
  if (!trimmed) return [];

  const [productsResult, ordersResult, customers] = await Promise.all([
    guard.supabase
      .from("products")
      .select("id, name, brand, images")
      .ilike("name", `%${trimmed}%`)
      .limit(RESULTS_PER_TYPE),
    guard.supabase
      .from("orders")
      .select("id, order_number, status")
      .ilike("order_number", `%${trimmed}%`)
      .limit(RESULTS_PER_TYPE),
    getAllCustomers(),
  ]);

  const products: AdminSearchResult[] = (productsResult.data ?? []).map((product) => ({
    type: "product",
    id: product.id,
    title: product.name,
    subtitle: product.brand,
    href: `/admin/products/${product.id}`,
    image: product.images?.[0] ?? null,
  }));

  const orders: AdminSearchResult[] = (ordersResult.data ?? []).map((order) => ({
    type: "order",
    id: order.id,
    title: order.order_number,
    subtitle: order.status,
    href: `/admin/orders/${order.id}`,
  }));

  const lowerQuery = trimmed.toLowerCase();
  const customerResults: AdminSearchResult[] = customers
    .filter(
      (customer) =>
        customer.name.toLowerCase().includes(lowerQuery) || customer.email.toLowerCase().includes(lowerQuery)
    )
    .slice(0, RESULTS_PER_TYPE)
    .map((customer) => ({
      type: "customer",
      id: customer.id,
      title: customer.name,
      subtitle: customer.email,
      href: `/admin/customers/${customer.id}`,
    }));

  return [...products, ...orders, ...customerResults];
}
