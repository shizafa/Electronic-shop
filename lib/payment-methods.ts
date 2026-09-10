import { createClient } from "@/lib/supabase/client";

export type CardBrand = "visa" | "mastercard";

export interface PaymentMethodRecord {
  id: string;
  brand: CardBrand;
  holder: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

interface PaymentMethodRow {
  id: string;
  brand: CardBrand;
  holder: string;
  last4: string;
  expiry: string;
  is_default: boolean;
}

function mapRow(row: PaymentMethodRow): PaymentMethodRecord {
  return {
    id: row.id,
    brand: row.brand,
    holder: row.holder,
    last4: row.last4,
    expiry: row.expiry,
    isDefault: row.is_default,
  };
}

// A signed-in user's saved payment methods, default first then newest. Uses the browser client
// (payment_methods_all_own RLS), same pattern as lib/orders.ts's getOrdersForUser.
export async function getPaymentMethodsForUser(userId: string): Promise<PaymentMethodRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("payment_methods")
    .select("id, brand, holder, last4, expiry, is_default")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getPaymentMethodsForUser failed", error);
    return [];
  }
  return (data ?? []).map((row) => mapRow(row as unknown as PaymentMethodRow));
}
