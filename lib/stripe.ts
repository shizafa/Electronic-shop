import "server-only";
import Stripe from "stripe";

// Server-side Stripe client, authenticated with the secret key — used by the card branch of
// lib/actions/orders.ts's placeOrder and the webhook at app/api/stripe/webhook. The `server-only`
// import makes any accidental client-bundle import a build error, same as lib/supabase/admin.ts.
// No apiVersion pinned: the SDK defaults to the API version it was released against.
//
// Created on first use rather than at import: `new Stripe(undefined)` throws, and this module is
// imported by lib/actions/orders.ts — so an eager client would take down every order action (COD
// included) and `next build` itself on any environment missing STRIPE_SECRET_KEY.
let client: Stripe | null = null;

export function getStripe(): Stripe {
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY!);
  return client;
}
