// Card-payment constants shared by the server (lib/actions/orders.ts's placeOrder) and the
// checkout UI (components/checkout/payment-method.tsx's Stripe card element) — kept free of any
// server-only import so both sides can use it.

// Stripe charges PKR, the currency every price is stored in (see lib/currency.ts).
export const CARD_CURRENCY = "pkr";

// Stripe's per-charge ceiling is 99,999,999 in the currency's minor unit — Rs 999,999.99 for PKR.
// Larger orders can't be paid by card, same idea as COD_MAX_ORDER_VALUE for cash on delivery.
export const CARD_MAX_ORDER_VALUE = 999999.99;

// Stripe amounts are integers in the minor unit (paisa), not decimal rupees.
export function toStripeAmount(amountInPKR: number): number {
  return Math.round(amountInPKR * 100);
}
