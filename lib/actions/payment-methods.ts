"use server";

import { createClient } from "@/lib/supabase/server";
import type { CardBrand } from "@/lib/payment-methods";

export interface PaymentMethodInput {
  brand: CardBrand;
  holder: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export type PaymentMethodMutationResult = { success: true; id: string } | { success: false; error: string };
export type PaymentMethodDeleteResult = { success: true } | { success: false; error: string };

function validate(input: PaymentMethodInput): string | null {
  if (!/^\d{4}$/.test(input.last4)) return "Last 4 digits must be exactly 4 numbers";
  if (!input.expiry.trim()) return "Expiry is required";
  return null;
}

// Unsets is_default on every other of the caller's own cards — scoped by payment_methods_all_own
// RLS (auth.uid() = user_id) plus an explicit .eq("user_id", user.id) below, same defense-in-depth
// as lib/actions/reviews.ts. Not atomic with the insert/update that follows (a concurrent save
// from the same user could race), but that's the same non-atomic risk address-book.tsx's
// client-side "unset the others" already accepts for addresses.is_default — fine for this
// low-stakes, single-user-at-a-time feature.
async function clearOtherDefaults(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, keepId?: string) {
  let query = supabase.from("payment_methods").update({ is_default: false }).eq("user_id", userId);
  if (keepId) query = query.neq("id", keepId);
  await query;
}

export async function addPaymentMethod(input: PaymentMethodInput): Promise<PaymentMethodMutationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You need to be signed in to add a card" };

  const validationError = validate(input);
  if (validationError) return { success: false, error: validationError };

  if (input.isDefault) await clearOtherDefaults(supabase, user.id);

  const { data, error } = await supabase
    .from("payment_methods")
    .insert({
      user_id: user.id,
      brand: input.brand,
      holder: input.holder.trim(),
      last4: input.last4,
      expiry: input.expiry.trim(),
      is_default: input.isDefault,
    })
    .select("id")
    .single();

  if (error || !data) return { success: false, error: "Failed to add card" };
  return { success: true, id: data.id };
}

export async function updatePaymentMethod(
  id: string,
  input: PaymentMethodInput
): Promise<PaymentMethodMutationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You need to be signed in to edit a card" };

  const validationError = validate(input);
  if (validationError) return { success: false, error: validationError };

  if (input.isDefault) await clearOtherDefaults(supabase, user.id, id);

  const { error, count } = await supabase
    .from("payment_methods")
    .update(
      {
        brand: input.brand,
        holder: input.holder.trim(),
        last4: input.last4,
        expiry: input.expiry.trim(),
        is_default: input.isDefault,
      },
      { count: "exact" }
    )
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: "Failed to update card" };
  if (!count) return { success: false, error: "Card not found" };
  return { success: true, id };
}

export async function deletePaymentMethod(id: string): Promise<PaymentMethodDeleteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You need to be signed in to remove a card" };

  const { error, count } = await supabase
    .from("payment_methods")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: "Failed to remove card" };
  if (!count) return { success: false, error: "Card not found" };
  return { success: true };
}
