"use server";

import { findRedeemableCoupon } from "@/lib/coupons";
import { createClient } from "@/lib/supabase/server";
import type { AppliedCoupon } from "@/types/coupon";

export type ValidateCouponResult = { success: true; coupon: AppliedCoupon } | { success: false; error: string };

// Checkout's "Apply" button. Only tells the browser enough to show the discount (code, type,
// value); placeOrder re-validates the code server-side and computes the discount itself, so
// nothing returned here is trusted when the order is placed. Signed-in only, like the checkout
// itself, so codes can't be guessed anonymously.
export async function validateCoupon(code: string): Promise<ValidateCouponResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const result = await findRedeemableCoupon(code);
  if (!result.ok) return { success: false, error: result.error };

  const { coupon } = result;
  return { success: true, coupon: { code: coupon.code, type: coupon.type, value: coupon.value } };
}
