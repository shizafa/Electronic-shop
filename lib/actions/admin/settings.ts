"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/actions/admin/guard";

export interface UpdateSalesTargetsInput {
  weeklyTarget: number;
  monthlyTarget: number;
}

export type SettingsActionResult = { success: true } | { success: false; error: string };

export async function updateSalesTargets(input: UpdateSalesTargetsInput): Promise<SettingsActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  if (input.weeklyTarget < 0 || input.monthlyTarget < 0) {
    return { success: false, error: "Targets can't be negative" };
  }

  const { error } = await guard.supabase
    .from("sales_targets")
    .update({
      weekly_target: input.weeklyTarget,
      monthly_target: input.monthlyTarget,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { success: false, error: "Failed to save targets" };
  return { success: true };
}

const updateSettingsSchema = z.object({
  storeName: z.string().trim().min(1, "Store name is required"),
  tagline: z.string().trim().max(300).optional(),
  logoUrl: z.string().url().nullable().optional(),
  faviconUrl: z.string().url().nullable().optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

export async function updateSettings(input: UpdateSettingsInput): Promise<SettingsActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const parsed = updateSettingsSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { error } = await guard.supabase
    .from("store_settings")
    .update({
      store_name: parsed.data.storeName,
      tagline: parsed.data.tagline || null,
      logo_url: parsed.data.logoUrl ?? null,
      favicon_url: parsed.data.faviconUrl ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { success: false, error: "Failed to save settings" };
  revalidatePath("/", "layout");
  return { success: true };
}

const updateContactSchema = z.object({
  email: z.string().trim().max(200).optional(),
  phone: z.string().trim().max(50).optional(),
  whatsapp: z.string().trim().max(50).optional(),
  address: z.string().trim().max(500).optional(),
  facebookUrl: z.string().trim().max(300).optional(),
  instagramUrl: z.string().trim().max(300).optional(),
  twitterUrl: z.string().trim().max(300).optional(),
  youtubeUrl: z.string().trim().max(300).optional(),
});

export type UpdateContactInput = z.infer<typeof updateContactSchema>;

export async function updateContact(input: UpdateContactInput): Promise<SettingsActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const parsed = updateContactSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { error } = await guard.supabase
    .from("store_settings")
    .update({
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      whatsapp: parsed.data.whatsapp || null,
      address: parsed.data.address || null,
      facebook_url: parsed.data.facebookUrl || null,
      instagram_url: parsed.data.instagramUrl || null,
      twitter_url: parsed.data.twitterUrl || null,
      youtube_url: parsed.data.youtubeUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { success: false, error: "Failed to save contact info" };
  revalidatePath("/", "layout");
  return { success: true };
}

const updateCommerceSchema = z.object({
  currencyCode: z.string().trim().min(1, "Currency code is required").max(10),
  currencySymbol: z.string().trim().min(1, "Currency symbol is required").max(10),
  shippingFlatRate: z.number().min(0, "Shipping rate can't be negative"),
  freeShippingThreshold: z.number().min(0).nullable().optional(),
  taxPercent: z.number().min(0, "Tax can't be negative").max(100, "Tax can't exceed 100%"),
  codEnabled: z.boolean(),
});

export type UpdateCommerceInput = z.infer<typeof updateCommerceSchema>;

export async function updateCommerce(input: UpdateCommerceInput): Promise<SettingsActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const parsed = updateCommerceSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { error } = await guard.supabase
    .from("store_settings")
    .update({
      currency_code: parsed.data.currencyCode,
      currency_symbol: parsed.data.currencySymbol,
      shipping_flat_rate: parsed.data.shippingFlatRate,
      free_shipping_threshold: parsed.data.freeShippingThreshold ?? null,
      tax_percent: parsed.data.taxPercent,
      cod_enabled: parsed.data.codEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { success: false, error: "Failed to save commerce settings" };
  revalidatePath("/", "layout");
  return { success: true };
}

const updatePoliciesSchema = z.object({
  shippingPolicy: z.string().trim().max(20000).optional(),
  returnPolicy: z.string().trim().max(20000).optional(),
  privacyPolicy: z.string().trim().max(20000).optional(),
  terms: z.string().trim().max(20000).optional(),
});

export type UpdatePoliciesInput = z.infer<typeof updatePoliciesSchema>;

export async function updatePolicies(input: UpdatePoliciesInput): Promise<SettingsActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const parsed = updatePoliciesSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { error } = await guard.supabase
    .from("store_settings")
    .update({
      shipping_policy: parsed.data.shippingPolicy || null,
      return_policy: parsed.data.returnPolicy || null,
      privacy_policy: parsed.data.privacyPolicy || null,
      terms: parsed.data.terms || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { success: false, error: "Failed to save policies" };
  revalidatePath("/", "layout");
  return { success: true };
}
