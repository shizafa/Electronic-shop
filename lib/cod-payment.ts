// Cash-on-delivery constants shared by the server (lib/actions/orders.ts's placeOrder) and the
// checkout UI (components/checkout/payment-method.tsx) — kept free of any server-only import so
// both sides can use it, same as lib/card-payment.ts.

// Maximum order total (PKR) allowed for Cash on Delivery.
export const COD_MAX_ORDER_VALUE = 300000;
