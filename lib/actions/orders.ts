"use server";

import { headers } from "next/headers";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CARD_CURRENCY, CARD_MAX_ORDER_VALUE, toStripeAmount } from "@/lib/card-payment";
import { findRedeemableCoupon } from "@/lib/coupons";
import { computeOrderTotals } from "@/lib/order-totals";
import { getSettings } from "@/lib/settings";
import { getStripe } from "@/lib/stripe";
import {
  failCardOrderWithoutPayment,
  paymentIntentOutcome,
  paymentStatusOutcome,
  syncOrderWithPaymentIntent,
  type CardPaymentOutcome,
} from "@/lib/stripe-orders";
import type { Coupon } from "@/types/coupon";
import type { InstallationSchedule, OrderAddressSnapshot, PaymentMethod } from "@/types/order";

export interface PlaceOrderLineItem {
  variantId: string;
  quantity: number;
}

export interface PlaceOrderInput {
  lineItems: PlaceOrderLineItem[];
  shippingAddress: OrderAddressSnapshot;
  billingAddress: OrderAddressSnapshot;
  paymentMethod: PaymentMethod;
  installation?: InstallationSchedule;
  // Card only: the Stripe ConfirmationToken (ctoken_...) the Payment Element created in the
  // browser on the payment step. Carries the card details; never the amount.
  confirmationTokenId?: string;
  // Just the code the customer applied — the discount itself is recomputed here from the coupons table.
  couponCode?: string;
}

export type PlaceOrderResult =
  | { success: true; orderId: string; orderNumber: string }
  // Card needs a 3-D Secure check: the browser finishes it with stripe.handleNextAction(clientSecret).
  | { success: true; requiresAction: true; clientSecret: string; orderId: string; orderNumber: string }
  | { success: false; error: string };

// Only cash on delivery and card (Stripe) are offered. jazzcash/easypaisa/raast stay in the
// PaymentMethod type and the payment_method enum so older orders still read correctly, but they
// had no real payment behind them, so new orders can't use them.
const AVAILABLE_PAYMENT_METHODS: PaymentMethod[] = ["cod", "card"];

// Absolute origin for Stripe's return_url (3-D Secure redirect fallback) — taken from the Server
// Action request itself so it's right on localhost and in production alike.
async function getRequestOrigin(): Promise<string> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin) return origin;
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "https";
  return `${protocol}://${host}`;
}

interface VariantWithProductRow {
  id: string;
  sku: string;
  price: string | number;
  images: string[] | null;
  products: {
    id: string;
    name: string;
    images: string[];
    categories: { name: string; installation_required: boolean } | null;
  } | null;
}

// Places an order for the currently authenticated user. Runs server-side (not a plain client
// function) so prices/totals are recomputed from the database rather than trusted from the
// browser — the client only sends variant ids + quantities, never prices.
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  if (input.lineItems.length === 0) return { success: false, error: "Cart is empty" };
  // Quantities come from the browser, so they're checked here: a negative one would subtract its
  // price from the total (lowering what the card is charged) and, via decrement_variant_stock's
  // `stock - quantity`, add stock instead of reserving it.
  if (input.lineItems.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) {
    return { success: false, error: "Invalid item quantity" };
  }

  if (!AVAILABLE_PAYMENT_METHODS.includes(input.paymentMethod)) {
    return { success: false, error: "This payment method is not available" };
  }

  const settings = await getSettings();
  if (input.paymentMethod === "cod" && !settings.codEnabled) {
    return { success: false, error: "Cash on Delivery is not available" };
  }
  if (input.paymentMethod === "card" && !input.confirmationTokenId) {
    return { success: false, error: "Please enter your card details" };
  }

  const variantIds = input.lineItems.map((item) => item.variantId);
  const { data: variantRows, error: variantError } = await supabase
    .from("variants")
    .select("id, sku, price, images, products(id, name, images, categories(name, installation_required))")
    .in("id", variantIds);

  if (variantError || !variantRows) {
    return { success: false, error: "Failed to load product data" };
  }

  const variantMap = new Map(
    (variantRows as unknown as VariantWithProductRow[]).map((row) => [row.id, row])
  );

  let subtotal = 0;
  let requiresInstallation = false;
  const orderItemRows: {
    product_id: string;
    variant_id: string;
    product_name: string;
    sku: string;
    image: string | null;
    unit_price: number;
    quantity: number;
    category_name: string;
    installation_required: boolean;
  }[] = [];

  for (const lineItem of input.lineItems) {
    const variantRow = variantMap.get(lineItem.variantId);
    const product = variantRow?.products;
    if (!variantRow || !product) {
      return { success: false, error: "One of the items in your cart is no longer available" };
    }

    const category = product.categories;
    const unitPrice = Number(variantRow.price);
    subtotal += unitPrice * lineItem.quantity;
    if (category?.installation_required) requiresInstallation = true;

    orderItemRows.push({
      product_id: product.id,
      variant_id: variantRow.id,
      product_name: product.name,
      sku: variantRow.sku,
      image: variantRow.images?.[0] ?? product.images?.[0] ?? null,
      unit_price: unitPrice,
      quantity: lineItem.quantity,
      category_name: category?.name ?? "",
      installation_required: category?.installation_required ?? false,
    });
  }

  let coupon: Coupon | null = null;
  if (input.couponCode) {
    const found = await findRedeemableCoupon(input.couponCode);
    if (!found.ok) return { success: false, error: found.error };
    coupon = found.coupon;
  }

  const { discountAmount, shippingFee, taxAmount, total } = computeOrderTotals(subtotal, settings, coupon);
  if (input.paymentMethod === "card" && total > CARD_MAX_ORDER_VALUE) {
    return { success: false, error: "This order is above the card payment limit. Please choose another payment method." };
  }

  const admin = createAdminClient();

  // Reserve one use of the coupon. redeem_coupon (0022_coupons.sql) re-checks active/expiry/limit
  // atomically, so if another checkout took the last use since findRedeemableCoupon, this one
  // fails here instead of both going through. The use is given back if the order can't be created
  // below, or later by fail_card_order if the card payment fails.
  if (coupon) {
    const { data: redeemed, error: redeemError } = await admin.rpc("redeem_coupon", { p_coupon_id: coupon.id });
    if (redeemError || !redeemed) return { success: false, error: "This coupon is no longer available" };
  }
  const releaseCoupon = async () => {
    if (coupon) await admin.rpc("release_coupon", { p_coupon_id: coupon.id });
  };

  // Decrement stock before creating the order, so a sold-out item never leaves a half-placed
  // order behind. decrement_variant_stock (supabase/migrations/0008) does this atomically per
  // line — each line's `UPDATE ... WHERE stock >= quantity` row-locks that variant, so two
  // checkouts racing for the last unit can't both succeed. Called via the service-role client
  // because the function's execute grant is service_role-only (see the migration for why).
  const { error: stockError } = await admin.rpc("decrement_variant_stock", {
    items: input.lineItems.map((item) => ({ variant_id: item.variantId, quantity: item.quantity })),
  });
  if (stockError) {
    await releaseCoupon();
    return { success: false, error: "One or more items in your cart just sold out" };
  }

  // Cash on delivery waits for the courier ("cod_pending"). Card starts "pending" and only becomes
  // "paid" once Stripe confirms the charge below (or later, via 3-D Secure / the webhook).
  const paymentStatus = input.paymentMethod === "cod" ? "cod_pending" : "pending";
  const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`; // e.g. ORD-2026-4821

  // The order, its items and its first history row are written with the service-role client:
  // customers have no insert grant on these tables (0020_orders_server_only_insert.sql), so an
  // order can only ever come from here, with server-computed prices. Service role bypasses RLS,
  // so user_id must be the verified user.id from getUser() above — never a client-sent value.
  const { data: orderRow, error: orderError } = await admin
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: user.id,
      status: "order_placed",
      payment_status: paymentStatus,
      payment_method: input.paymentMethod,
      subtotal,
      coupon_id: coupon?.id ?? null,
      coupon_code: coupon?.code ?? null,
      discount_amount: discountAmount,
      shipping_fee: shippingFee,
      tax_amount: taxAmount,
      total,
      shipping_address: input.shippingAddress,
      billing_address: input.billingAddress,
      // only attach installation details if at least one item actually requires the service
      installation: requiresInstallation ? (input.installation ?? null) : null,
    })
    .select("id, order_number")
    .single();

  if (orderError || !orderRow) {
    await releaseCoupon();
    return { success: false, error: "Failed to create order" };
  }

  const { error: itemsError } = await admin
    .from("order_items")
    .insert(orderItemRows.map((item) => ({ ...item, order_id: orderRow.id })));
  if (itemsError) {
    return { success: false, error: "Failed to save order items" };
  }

  const { error: historyError } = await admin
    .from("order_status_history")
    .insert({ order_id: orderRow.id, status: "order_placed" });
  if (historyError) {
    return { success: false, error: "Failed to record order status" };
  }

  if (input.paymentMethod === "card") {
    return chargeCardOrder(orderRow.id, orderRow.order_number, total, input.confirmationTokenId!);
  }

  return { success: true, orderId: orderRow.id, orderNumber: orderRow.order_number };
}

// Charges a just-created (payment_status 'pending') card order. The amount comes from the order
// total computed above from database prices — the browser's Payment Element only ever supplied
// the card, via the ConfirmationToken. The order id doubles as the idempotency key, so a retried
// request can never charge the same order twice.
async function chargeCardOrder(
  orderId: string,
  orderNumber: string,
  total: number,
  confirmationTokenId: string
): Promise<PlaceOrderResult> {
  let paymentIntent: Stripe.PaymentIntent;
  try {
    paymentIntent = await getStripe().paymentIntents.create(
      {
        amount: toStripeAmount(total),
        currency: CARD_CURRENCY,
        payment_method_types: ["card"],
        confirm: true,
        confirmation_token: confirmationTokenId,
        return_url: `${await getRequestOrigin()}/checkout/confirmation?orderId=${orderId}`,
        metadata: { order_id: orderId, order_number: orderNumber },
      },
      { idempotencyKey: `order-${orderId}` }
    );
  } catch (error) {
    // A declined card throws (StripeCardError) but still leaves a PaymentIntent behind — sync
    // against it so the order is linked to it; anything else (bad token, network) never got one.
    // Best-effort: if this DB write fails too, the payment_intent.payment_failed webhook settles it.
    try {
      if (error instanceof Stripe.errors.StripeError && error.payment_intent) {
        await syncOrderWithPaymentIntent(orderId, error.payment_intent);
      } else {
        await failCardOrderWithoutPayment(orderId);
      }
    } catch {
      // left 'pending' — the webhook settles it
    }
    const message =
      error instanceof Stripe.errors.StripeCardError ? error.message : "Payment failed. Please try again.";
    return { success: false, error: message };
  }

  // The result shown to the customer comes from Stripe's answer, not from the DB write — if
  // recording it fails, the webhook retries it, and a successful charge must still read as success.
  const outcome = paymentIntentOutcome(paymentIntent);
  try {
    await syncOrderWithPaymentIntent(orderId, paymentIntent);
  } catch {
    // left 'pending' — the webhook settles it
  }

  if (outcome === "failed") {
    return {
      success: false,
      error: paymentIntent.last_payment_error?.message ?? "Payment failed. Please try again.",
    };
  }
  if (paymentIntent.status === "requires_action" && paymentIntent.client_secret) {
    return { success: true, requiresAction: true, clientSecret: paymentIntent.client_secret, orderId, orderNumber };
  }
  return { success: true, orderId, orderNumber };
}

// Loads one of the caller's own card orders (orders_select_own RLS, plus an explicit user_id
// match so a wrong id reads as "not found" rather than relying on RLS alone).
async function getOwnCardOrder(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("orders")
    .select("id, payment_method, payment_status, stripe_payment_intent_id")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data || data.payment_method !== "card") return null;
  return data as { id: string; payment_status: string; stripe_payment_intent_id: string | null };
}

export type CardPaymentActionResult = { success: true; outcome: CardPaymentOutcome } | { success: false; error: string };

// Called by the checkout when the 3-D Secure step fails or is closed. Cancels the PaymentIntent,
// then applies whatever Stripe now reports rather than assuming failure — if the payment actually
// went through in the meantime, the cancel is refused and the order is marked paid instead.
export async function cancelCardOrder(orderId: string): Promise<CardPaymentActionResult> {
  const order = await getOwnCardOrder(orderId);
  if (!order) return { success: false, error: "Order not found" };
  if (order.payment_status !== "pending") {
    return { success: true, outcome: paymentStatusOutcome(order.payment_status) };
  }

  try {
    if (!order.stripe_payment_intent_id) {
      await failCardOrderWithoutPayment(orderId);
      return { success: true, outcome: "failed" };
    }

    try {
      await getStripe().paymentIntents.cancel(order.stripe_payment_intent_id);
    } catch {
      // Already succeeded or already cancelled — the retrieve below reports which.
    }
    const paymentIntent = await getStripe().paymentIntents.retrieve(order.stripe_payment_intent_id);
    return { success: true, outcome: await syncOrderWithPaymentIntent(orderId, paymentIntent) };
  } catch {
    return { success: false, error: "Couldn't update the payment. Please try again." };
  }
}

// Called by the confirmation page for a card order still showing 'pending', so it doesn't have
// to wait for the webhook to arrive to show the real result.
export async function syncCardPayment(orderId: string): Promise<CardPaymentActionResult> {
  const order = await getOwnCardOrder(orderId);
  if (!order) return { success: false, error: "Order not found" };
  if (order.payment_status !== "pending" || !order.stripe_payment_intent_id) {
    return { success: true, outcome: paymentStatusOutcome(order.payment_status) };
  }

  try {
    const paymentIntent = await getStripe().paymentIntents.retrieve(order.stripe_payment_intent_id);
    return { success: true, outcome: await syncOrderWithPaymentIntent(orderId, paymentIntent) };
  } catch {
    return { success: false, error: "Couldn't check the payment status" };
  }
}
