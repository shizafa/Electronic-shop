"use client";

import { useImperativeHandle, useMemo, type Ref } from "react";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { CARD_CURRENCY, toStripeAmount } from "@/lib/card-payment";

// Loaded once per page, at module level, as Stripe recommends — re-creating it on every render
// would re-inject Stripe.js. Also used by checkout-flow.tsx to finish a 3-D Secure check.
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export type CardTokenResult = { confirmationTokenId: string } | { error: string };

export interface StripeCardHandle {
  // Validates the card fields and turns them into a ConfirmationToken (ctoken_...) for
  // lib/actions/orders.ts's placeOrder. The card itself never reaches this app's server.
  createConfirmationToken(billing: { name: string; phone: string }): Promise<CardTokenResult>;
}

// Stripe's iframe can't see the template stylesheet, so the template's own tokens are repeated
// here (style.min.css :root — --font-primary, --color-primary, --color-gray-*, --color-danger,
// --radius) to make the card fields read like the rest of the checkout form.
const appearance: StripeElementsOptions["appearance"] = {
  theme: "stripe",
  variables: {
    fontFamily: '"Cabin", sans-serif',
    fontSizeBase: "15px",
    colorPrimary: "#215ADA",
    colorText: "#333333",
    colorTextPlaceholder: "#888888",
    colorDanger: "#E53E3E",
    borderRadius: "6px",
  },
  rules: {
    ".Input": { border: "1px solid #E6E6E6", boxShadow: "none" },
  },
};

const fonts: StripeElementsOptions["fonts"] = [
  { cssSrc: "https://fonts.googleapis.com/css2?family=Cabin:wght@400;600;700&display=swap" },
];

function CardFields({ ref }: { ref: Ref<StripeCardHandle> }) {
  const stripe = useStripe();
  const elements = useElements();

  useImperativeHandle(
    ref,
    () => ({
      async createConfirmationToken(billing) {
        if (!stripe || !elements) return { error: "The card form is still loading. Please try again." };

        const { error: submitError } = await elements.submit();
        if (submitError) return { error: submitError.message ?? "Please check your card details" };

        const { confirmationToken, error } = await stripe.createConfirmationToken({
          elements,
          params: { payment_method_data: { billing_details: { name: billing.name, phone: billing.phone } } },
        });
        if (error) return { error: error.message ?? "Please check your card details" };
        return { confirmationTokenId: confirmationToken.id };
      },
    }),
    [stripe, elements]
  );

  return <PaymentElement />;
}

// StripeCardElement — Stripe's Payment Element, in deferred mode (no PaymentIntent exists yet:
// placeOrder creates and confirms one server-side from the ConfirmationToken). `amount` is only
// what the card form displays and uses for its checks; the charged amount is computed on the
// server from database prices.
export function StripeCardElement({ amount, ref }: { amount: number; ref: Ref<StripeCardHandle> }) {
  const options = useMemo<StripeElementsOptions>(
    () => ({
      mode: "payment",
      amount: toStripeAmount(amount),
      currency: CARD_CURRENCY,
      paymentMethodTypes: ["card"],
      appearance,
      fonts,
    }),
    [amount]
  );

  return (
    <Elements stripe={stripePromise} options={options}>
      <CardFields ref={ref} />
    </Elements>
  );
}
