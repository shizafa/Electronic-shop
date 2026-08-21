import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("cart.heading"),
};

// /cart route: renders the shopping cart view
export default function CartPage() {
  return <CartView />;
}