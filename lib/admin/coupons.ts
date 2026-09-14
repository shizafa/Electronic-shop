import "server-only";
import { isCouponExpired, mapCouponRow, type CouponRow } from "@/lib/coupons";
import { createClient } from "@/lib/supabase/server";
import type { Coupon } from "@/types/coupon";

// Admin-scoped coupon reads (coupons_admin_all RLS). Cookie-bound client is sufficient, same
// reasoning as lib/admin/orders.ts.

export type AdminCoupon = Coupon & { isExpired: boolean };

export async function getAllCouponsForAdmin(): Promise<AdminCoupon[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("getAllCouponsForAdmin failed", error);
    return [];
  }
  const now = Date.now();
  return (data ?? []).map((row) => {
    const coupon = mapCouponRow(row as CouponRow);
    return { ...coupon, isExpired: isCouponExpired(coupon, now) };
  });
}

export async function getCouponByIdForAdmin(id: string): Promise<Coupon | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("coupons").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("getCouponByIdForAdmin failed", error);
    return undefined;
  }
  return data ? mapCouponRow(data as CouponRow) : undefined;
}
