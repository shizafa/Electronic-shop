import Link from "next/link";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

export default function AdminOrderNotFound() {
  return (
    <div className="flex max-w-3xl flex-col items-start gap-3">
      <h2 className="text-xl font-semibold text-foreground">{t("admin.orders.orderNotFound")}</h2>
      <p className="text-sm text-muted-foreground">{t("admin.orders.orderNotFoundHint")}</p>
      <Button asChild variant="outline">
        <Link href="/admin/orders">{t("admin.orders.backToOrders")}</Link>
      </Button>
    </div>
  );
}
