import type { Metadata } from "next";
import { OrderHistory } from "@/components/account/order-history";
import { t } from "@/lib/i18n";

// See addresses/page.tsx for why account routes are forced dynamic.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: t("account.orders"),
};

// /account/orders route: renders the order history list
export default function AccountOrdersPage() {
  return <OrderHistory />;
}