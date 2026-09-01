import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";
import { getSettings } from "@/lib/settings";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("cart.heading"),
};

// /cart route: renders the shopping cart view
export default async function CartPage() {
  const settings = await getSettings();
  return <CartView settings={settings} />;
}