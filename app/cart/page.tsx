import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("cart.heading"),
};

export default function CartPage() {
  return <CartView />;
}