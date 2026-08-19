import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { t } from "@/lib/i18n";
import type { AdminCustomerSummary } from "@/lib/admin/customers";

interface CustomersTableProps {
  customers: AdminCustomerSummary[];
}

export function CustomersTable({ customers }: CustomersTableProps) {
  if (customers.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("admin.customers.noCustomers")}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("admin.customers.customer")}</TableHead>
          <TableHead>{t("admin.customers.email")}</TableHead>
          <TableHead>{t("admin.customers.phone")}</TableHead>
          <TableHead>{t("admin.customers.orders")}</TableHead>
          <TableHead>{t("admin.customers.joined")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell className="font-medium">
              <Link href={`/admin/customers/${customer.id}`} className="hover:underline">
                {customer.name || "—"}
              </Link>
              {customer.isAdmin && (
                <Badge variant="secondary" className="ms-2">
                  {t("admin.customers.admin")}
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">{customer.email}</TableCell>
            <TableCell className="text-muted-foreground">{customer.phone || "—"}</TableCell>
            <TableCell>{customer.ordersCount}</TableCell>
            <TableCell className="text-muted-foreground">{customer.createdAt.slice(0, 10)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
