// "percent" takes a percentage off the subtotal; "flat" takes a fixed rupee amount off it.
export type CouponType = "percent" | "flat";

// A discount code, as admins manage it (coupons table, 0022_coupons.sql)
export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  // null = unlimited
  usageLimit: number | null;
  usedCount: number;
  // ISO timestamp (end of the expiry day, Pakistan time); null = never expires
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

// The part of a validated coupon the checkout needs to price the cart — no id or usage numbers
// are sent to the browser.
export interface AppliedCoupon {
  code: string;
  type: CouponType;
  value: number;
}
