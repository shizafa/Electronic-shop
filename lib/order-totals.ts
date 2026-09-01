import type { StoreSettings } from "@/lib/settings";

export type CommerceSettings = Pick<StoreSettings, "shippingFlatRate" | "freeShippingThreshold" | "taxPercent">;

export interface OrderTotals {
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  total: number;
}

// Single source of truth for shipping/tax/total, read from store_settings' Commerce fields.
// Used by the cart, the checkout flow, and server-side order creation so all three always
// agree on what a cart actually costs. A free-shipping threshold (if set) waives the flat
// shipping rate once the subtotal reaches it; tax is a flat percentage of the subtotal.
export function computeOrderTotals(subtotal: number, settings: CommerceSettings): OrderTotals {
  const shippingFee =
    settings.freeShippingThreshold !== null && subtotal >= settings.freeShippingThreshold
      ? 0
      : settings.shippingFlatRate;
  const taxAmount = Math.round(subtotal * (settings.taxPercent / 100) * 100) / 100;
  const total = subtotal + shippingFee + taxAmount;

  return { subtotal, shippingFee, taxAmount, total };
}
