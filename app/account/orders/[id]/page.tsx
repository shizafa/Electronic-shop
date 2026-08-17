import type { Metadata } from "next";
import { OrderDetail } from "@/components/account/order-detail";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("account.orderDetail"),
};

export default async function AccountOrderDetailPage({ params }: PageProps<"/account/orders/[id]">) {
  const { id } = await params;
  return <OrderDetail orderId={id} />;
}