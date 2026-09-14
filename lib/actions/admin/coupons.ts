"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/actions/admin/guard";
import { expiryDateToTimestamp } from "@/lib/coupon-dates";

const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9_-]{3,32}$/, "Code must be 3–32 letters, numbers, dashes or underscores"),
    type: z.enum(["percent", "flat"]),
    value: z.number().positive("Value must be greater than 0"),
    usageLimit: z.number().int("Usage limit must be a whole number").positive("Usage limit must be at least 1").nullable(),
    // "YYYY-MM-DD" from the form's date input; null = never expires
    expiresOn: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid expiry date")
      .nullable(),
    isActive: z.boolean(),
  })
  .refine((input) => input.type !== "percent" || input.value <= 100, {
    message: "A percentage discount can't exceed 100%",
  });

export type CouponFormInput = z.input<typeof couponSchema>;

export type CouponActionResult = { success: true; id: string } | { success: false; error: string };
export type SetCouponActiveResult = { success: true } | { success: false; error: string };

function revalidateCouponPaths(id: string) {
  revalidatePath("/admin/coupons");
  revalidatePath(`/admin/coupons/${id}`);
}

function toCouponColumns(input: z.output<typeof couponSchema>) {
  return {
    code: input.code,
    type: input.type,
    value: input.value,
    usage_limit: input.usageLimit,
    expires_at: input.expiresOn ? expiryDateToTimestamp(input.expiresOn) : null,
    is_active: input.isActive,
  };
}

const DUPLICATE_CODE_ERROR = "A coupon with this code already exists";

export async function createCoupon(input: CouponFormInput): Promise<CouponActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { data, error } = await guard.supabase
    .from("coupons")
    .insert(toCouponColumns(parsed.data))
    .select("id")
    .single();

  if (error || !data) {
    if (error?.code === "23505") return { success: false, error: DUPLICATE_CODE_ERROR };
    return { success: false, error: "Failed to create coupon" };
  }
  revalidateCouponPaths(data.id);
  return { success: true, id: data.id };
}

// used_count is never written here — only redeem_coupon/release_coupon (0022_coupons.sql) move it.
export async function updateCoupon(id: string, input: CouponFormInput): Promise<CouponActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { error } = await guard.supabase.from("coupons").update(toCouponColumns(parsed.data)).eq("id", id);

  if (error) {
    if (error.code === "23505") return { success: false, error: DUPLICATE_CODE_ERROR };
    return { success: false, error: "Failed to save coupon" };
  }
  revalidateCouponPaths(id);
  return { success: true, id };
}

// The list view's inline Active toggle.
export async function setCouponActive(id: string, isActive: boolean): Promise<SetCouponActiveResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from("coupons").update({ is_active: isActive }).eq("id", id);
  if (error) return { success: false, error: "Failed to update coupon" };

  revalidateCouponPaths(id);
  return { success: true };
}
