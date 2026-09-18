import { notFound } from "next/navigation";
import { OrdersTable } from "@/components/admin/orders/orders-table";
import { Badge } from "@/components/ui/badge";
import { getCustomerById } from "@/lib/admin/customers";
import { getOrdersForCustomer } from "@/lib/admin/orders";
import { t } from "@/lib/i18n";

export default async function AdminCustomerDetailPage({ params }: PageProps<"/admin/customers/[id]">) {
  const { id } = await params;
  const customer = await getCustomerById(id);
  if (!customer) notFound();

  const orders = await getOrdersForCustomer(id);

  // min-w-0 on this column and on every block that holds unbroken text (emails) or a table:
  // as a flex child their automatic minimum size is content-based, which is what pushes the
  // sidebar layout wider than the viewport instead of letting the table's own scroller absorb it.
  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">{customer.name || "—"}</h2>
          {customer.isAdmin && <Badge variant="secondary">{t("admin.customers.admin")}</Badge>}
        </div>
        <p className="mt-1 text-sm break-words text-muted-foreground">
          {customer.email} · {customer.phone || "—"}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("admin.customers.joined")} {customer.createdAt.slice(0, 10)}
        </p>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{t("admin.customers.addresses")}</p>
        {customer.addresses.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">{t("account.noAddresses")}</p>
        ) : (
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {customer.addresses.map((address) => (
              <div key={address.id} className="min-w-0 rounded-lg border border-border p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-foreground">{address.label}</p>
                  {address.isDefault && <Badge variant="outline">{t("account.default")}</Badge>}
                </div>
                <p className="mt-1 break-words text-muted-foreground">
                  {address.fullName} · {address.phone}
                  <br />
                  {address.addressLine}, {address.area}, {address.city}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{t("admin.customers.orderHistory")}</p>
        <div className="mt-2 min-w-0">
          <OrdersTable orders={orders} />
        </div>
      </div>
    </div>
  );
}
