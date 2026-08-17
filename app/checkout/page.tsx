import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("common.checkout"),
};

// /checkout route: renders the multi-step checkout flow
export default function CheckoutPage() {
  return <CheckoutFlow />;
}