import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Coupon, CouponType } from "@/types/coupon";

export interface CouponRow {
  id: string;
  code: string;
  type: CouponType;
  value: string | number;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export function mapCouponRow(row: CouponRow): Coupon {
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    value: Number(row.value),
    usageLimit: row.usage_limit,
    usedCount: row.used_count,
    expiresAt: row.expires_at,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

// Codes are stored upper-case (0022_coupons.sql), so whatever the customer typed is matched the same way.
export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}

export function isCouponExpired(coupon: Pick<Coupon, "expiresAt">, now = Date.now()): boolean {
  return coupon.expiresAt !== null && new Date(coupon.expiresAt).getTime() <= now;
}

export type RedeemableCouponResult = { ok: true; coupon: Coupon } | { ok: false; error: string };

// Looks a code up for checkout and checks it can still be used. Read with the service-role client
// because customers have no select grant on coupons. This is only a pre-check for a clear error
// message — placeOrder's redeem_coupon call re-checks all of it atomically when the use is reserved.
export async function findRedeemableCoupon(code: string): Promise<RedeemableCouponResult> {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return { ok: false, error: "Enter a coupon code" };

  const admin = createAdminClient();
  const { data, error } = await admin.from("coupons").select("*").eq("code", normalized).maybeSingle();
  if (error) return { ok: false, error: "Couldn't check this coupon. Please try again." };
  if (!data) return { ok: false, error: "This coupon code isn't valid" };

  const coupon = mapCouponRow(data as CouponRow);
  if (!coupon.isActive) return { ok: false, error: "This coupon code isn't valid" };
  if (isCouponExpired(coupon)) return { ok: false, error: "This coupon has expired" };
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, error: "This coupon has reached its usage limit" };
  }
  return { ok: true, coupon };
}
