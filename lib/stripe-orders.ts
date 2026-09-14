import "server-only";
import { revalidatePath } from "next/cache";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Moves a card order's payment_status to match its Stripe PaymentIntent. Shared by
// lib/actions/orders.ts (placeOrder, cancelCardOrder, syncCardPayment) and the webhook at
// app/api/stripe/webhook — all of which can report on the same order, in any order, more than
// once. Every transition is a conditional `... where payment_status = 'pending'` update, so only
// the first caller to see a final status actually changes the row; everyone after it matches
// nothing and stops, which is what keeps a failed order from being restocked twice.
//
// Uses the service-role client: customers have no RLS update grant on orders (only
// orders_update_admin), and the webhook has no user session at all.

export type CardPaymentOutcome = "paid" | "pending" | "failed";

function revalidateOrderPaths(orderId: string) {
  // Same paths lib/actions/admin/orders.ts revalidates after a status change.
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderId}`);
}

async function markOrderPaid(orderId: string, paymentIntentId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .update({ payment_status: "paid", stripe_payment_intent_id: paymentIntentId })
    .eq("id", orderId)
    .eq("payment_method", "card")
    .eq("payment_status", "pending")
    .select("id");
  if (error) throw error;
  if (data.length) revalidateOrderPaths(orderId);
}

// Payment failed or was cancelled: mark the order failed + cancelled, record the cancellation in
// its status history, and give its stock back (placeOrder decremented it before charging). All
// three happen in one transaction inside fail_card_order (0021_fail_card_order.sql), so a failure
// partway through leaves the order pending for the next caller to retry instead of losing stock.
async function failCardOrder(orderId: string, paymentIntentId: string | null) {
  const admin = createAdminClient();
  const { data: failed, error } = await admin.rpc("fail_card_order", {
    p_order_id: orderId,
    p_payment_intent_id: paymentIntentId,
  });
  if (error) throw error;
  if (!failed) return; // already settled by an earlier caller

  revalidateOrderPaths(orderId);
}

// What a PaymentIntent's status means for its order. Orders are only ever created with an
// already-confirmed PaymentIntent (placeOrder passes confirm: true), so requires_payment_method
// here always means "an attempt was made and failed", never "not attempted yet". Everything else
// (requires_action = 3-D Secure pending, processing, ...) isn't final yet.
export function paymentIntentOutcome(paymentIntent: Stripe.PaymentIntent): CardPaymentOutcome {
  if (paymentIntent.status === "succeeded") return "paid";
  if (paymentIntent.status === "canceled" || paymentIntent.status === "requires_payment_method") return "failed";
  return "pending";
}

// Same mapping for the payment_status already stored on an order.
export function paymentStatusOutcome(paymentStatus: string): CardPaymentOutcome {
  if (paymentStatus === "pending") return "pending";
  return paymentStatus === "paid" || paymentStatus === "refunded" ? "paid" : "failed";
}

// Applies a PaymentIntent's current status to its order.
export async function syncOrderWithPaymentIntent(
  orderId: string,
  paymentIntent: Stripe.PaymentIntent
): Promise<CardPaymentOutcome> {
  const outcome = paymentIntentOutcome(paymentIntent);
  if (outcome === "paid") {
    await markOrderPaid(orderId, paymentIntent.id);
    return outcome;
  }

  if (outcome === "failed") {
    await failCardOrder(orderId, paymentIntent.id);
    return outcome;
  }

  // requires_action (3-D Secure pending), processing, ... — not final yet; just link the payment.
  const admin = createAdminClient();
  const { error } = await admin
    .from("orders")
    .update({ stripe_payment_intent_id: paymentIntent.id })
    .eq("id", orderId)
    .eq("payment_method", "card")
    .eq("payment_status", "pending");
  if (error) throw error;
  return outcome;
}

// For a card order whose PaymentIntent never got created (Stripe rejected the request itself), so
// there's nothing to sync against.
export async function failCardOrderWithoutPayment(orderId: string) {
  await failCardOrder(orderId, null);
}

// A full refund issued from the Stripe Dashboard (charge.refunded webhook). Stock isn't touched —
// a refund doesn't mean the goods came back; that stays an admin decision.
export async function markOrderRefunded(paymentIntentId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .update({ payment_status: "refunded" })
    .eq("stripe_payment_intent_id", paymentIntentId)
    .eq("payment_status", "paid")
    .select("id");
  if (error) throw error;
  for (const row of data) revalidateOrderPaths(row.id);
}
