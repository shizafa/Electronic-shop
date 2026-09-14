import type { StoreSettings } from "@/lib/settings";
import type { CouponType } from "@/types/coupon";

export type CommerceSettings = Pick<StoreSettings, "shippingFlatRate" | "freeShippingThreshold" | "taxPercent">;

export interface OrderTotals {
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
}

// How much a coupon takes off a subtotal. A flat coupon never takes off more than the subtotal
// itself; a percentage is capped at 100 by the coupons table (0022_coupons.sql).
export function computeDiscountAmount(subtotal: number, coupon: { type: CouponType; value: number }): number {
  const amount = coupon.type === "percent" ? Math.round(subtotal * coupon.value) / 100 : coupon.value;
  return Math.min(amount, subtotal);
}

// Single source of truth for discount/shipping/tax/total, read from store_settings' Commerce
// fields. Used by the cart, the checkout flow, and server-side order creation so all three always
// agree on what a cart actually costs. A coupon (if any) comes off the subtotal first; the
// free-shipping threshold and the flat tax percentage then both apply to the discounted amount.
export function computeOrderTotals(
  subtotal: number,
  settings: CommerceSettings,
  coupon?: { type: CouponType; value: number } | null
): OrderTotals {
  const discountAmount = coupon ? computeDiscountAmount(subtotal, coupon) : 0;
  const discountedSubtotal = subtotal - discountAmount;
  const shippingFee =
    settings.freeShippingThreshold !== null && discountedSubtotal >= settings.freeShippingThreshold
      ? 0
      : settings.shippingFlatRate;
  const taxAmount = Math.round(discountedSubtotal * (settings.taxPercent / 100) * 100) / 100;
  const total = discountedSubtotal + shippingFee + taxAmount;

  return { subtotal, discountAmount, shippingFee, taxAmount, total };
}
