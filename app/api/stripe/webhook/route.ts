import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { markOrderRefunded, syncOrderWithPaymentIntent } from "@/lib/stripe-orders";

// Stripe webhook — the source of truth for card payment results. placeOrder and the checkout's
// 3-D Secure follow-up already settle most orders directly; this catches whatever they missed
// (tab closed mid-3-D Secure, a DB write that failed, refunds issued from the Dashboard).
// Every handler is idempotent (see lib/stripe-orders.ts), so Stripe's retries and duplicate
// deliveries are harmless.
//
// Locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook`, with the whsec_... it
// prints in STRIPE_WEBHOOK_SECRET. In production: a Dashboard webhook endpoint with its own secret.
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return new Response("Missing Stripe signature or webhook secret", { status: 400 });
  }

  // The signature is computed over the exact raw bytes, so the body must be read as text — never
  // parsed and re-serialized first.
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return new Response("Invalid Stripe signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
      case "payment_intent.payment_failed":
      case "payment_intent.canceled": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.order_id;
        if (orderId) await syncOrderWithPaymentIntent(orderId, paymentIntent);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object;
        const paymentIntentId =
          typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        // charge.refunded is also sent for partial refunds; only a full refund flips the order.
        if (charge.refunded && paymentIntentId) await markOrderRefunded(paymentIntentId);
        break;
      }
    }
  } catch {
    // Non-2xx makes Stripe retry the delivery with backoff.
    return new Response("Webhook handler failed", { status: 500 });
  }

  // Any other event type is acknowledged and ignored.
  return new Response(null, { status: 200 });
}
