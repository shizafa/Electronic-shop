import "server-only";
import { requireAdmin } from "@/lib/actions/admin/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Address } from "@/types/user";

export interface AdminCustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  ordersCount: number;
  createdAt: string;
}

export interface AdminCustomerDetail extends AdminCustomerSummary {
  addresses: Address[];
}

interface ProfileRow {
  id: string;
  name: string;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
}

interface AddressRow {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  city: string;
  area: string;
  address_line: string;
  is_default: boolean;
}

function mapAddressRow(row: AddressRow): Address {
  return {
    id: row.id,
    label: row.label,
    fullName: row.full_name,
    phone: row.phone,
    city: row.city,
    area: row.area,
    addressLine: row.address_line,
    isDefault: row.is_default,
  };
}

// Customer reads need two things RLS doesn't grant admins: another user's email (lives on
// auth.users, not exposed via PostgREST — only reachable via the GoTrue admin API) and
// another user's addresses (addresses RLS is fully owner-scoped, no admin-select policy).
// Both require the service-role client, so every export here calls requireAdmin() first
// (using the normal cookie-bound client) before touching it.

export async function getAllCustomers(): Promise<AdminCustomerSummary[]> {
  const guard = await requireAdmin();
  if (!guard.ok) return [];

  const admin = createAdminClient();
  const [{ data: profiles, error: profilesError }, { data: authUsers, error: listError }, { data: orders }] =
    await Promise.all([
      admin.from("profiles").select("id, name, phone, is_admin, created_at"),
      admin.auth.admin.listUsers({ perPage: 1000 }),
      admin.from("orders").select("user_id"),
    ]);
  if (profilesError || listError) {
    console.error("getAllCustomers failed", profilesError ?? listError);
    return [];
  }

  const emailById = new Map(authUsers.users.map((user) => [user.id, user.email ?? ""]));
  const orderCountById = new Map<string, number>();
  for (const order of orders ?? []) {
    orderCountById.set(order.user_id, (orderCountById.get(order.user_id) ?? 0) + 1);
  }

  return (profiles as ProfileRow[]).map((profile) => ({
    id: profile.id,
    name: profile.name,
    email: emailById.get(profile.id) ?? "",
    phone: profile.phone ?? "",
    isAdmin: profile.is_admin,
    ordersCount: orderCountById.get(profile.id) ?? 0,
    createdAt: profile.created_at,
  }));
}

export async function getCustomerById(id: string): Promise<AdminCustomerDetail | undefined> {
  const guard = await requireAdmin();
  if (!guard.ok) return undefined;

  const admin = createAdminClient();
  const [{ data: profile }, { data: authUser, error: userError }, { data: addressRows }, { count: ordersCount }] =
    await Promise.all([
      admin.from("profiles").select("id, name, phone, is_admin, created_at").eq("id", id).maybeSingle(),
      admin.auth.admin.getUserById(id),
      admin
        .from("addresses")
        .select("id, label, full_name, phone, city, area, address_line, is_default")
        .eq("user_id", id)
        .order("created_at"),
      admin.from("orders").select("id", { count: "exact", head: true }).eq("user_id", id),
    ]);
  if (!profile || userError) return undefined;

  return {
    id: profile.id,
    name: profile.name,
    email: authUser.user?.email ?? "",
    phone: profile.phone ?? "",
    isAdmin: profile.is_admin,
    ordersCount: ordersCount ?? 0,
    createdAt: profile.created_at,
    addresses: (addressRows ?? []).map(mapAddressRow),
  };
}
