import type { Metadata } from "next";
import { PaymentMethods } from "@/components/account/payment-methods";

// See ../orders/page.tsx for why account routes are forced dynamic.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment Methods",
};

// /account/payment-methods route: renders the saved-cards manager (see
// components/account/payment-methods.tsx for its data flow).
export default function AccountPaymentMethodsPage() {
  return <PaymentMethods />;
}
