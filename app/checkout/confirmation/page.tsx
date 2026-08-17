import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmation } from "@/components/checkout/order-confirmation";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("checkout.confirmationHeading"),
};

export default function CheckoutConfirmationPage() {
  return (
    <Suspense>
      <OrderConfirmation />
    </Suspense>
  );
}