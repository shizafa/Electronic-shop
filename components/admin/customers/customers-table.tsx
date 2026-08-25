import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CopyButton } from "@/components/admin/customers/copy-button";
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
    <div className="rounded-lg border border-border">
      <Table className="min-w-[880px]">
        <TableHeader>
          <TableRow>
            <TableHead>{t("admin.customers.userId")}</TableHead>
            <TableHead>{t("admin.customers.customer")}</TableHead>
            <TableHead>{t("admin.customers.email")}</TableHead>
            <TableHead>{t("admin.customers.phone")}</TableHead>
            <TableHead>{t("admin.customers.role")}</TableHead>
            <TableHead>{t("admin.customers.orders")}</TableHead>
            <TableHead>{t("admin.customers.joined")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-mono text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span>{customer.id.slice(0, 8)}...</span>
                  <CopyButton value={customer.id} />
                </div>
              </TableCell>
              <TableCell className="font-medium">
                <Link href={`/admin/customers/${customer.id}`} className="hover:underline">
                  {customer.name || "—"}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <span>{customer.email}</span>
                  {customer.email && <CopyButton value={customer.email} />}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{customer.phone || "—"}</TableCell>
              <TableCell>
                {customer.isAdmin ? (
                  <Badge variant="secondary">{t("admin.customers.admin")}</Badge>
                ) : (
                  <Badge variant="outline">{t("admin.customers.role.customer")}</Badge>
                )}
              </TableCell>
              <TableCell>{customer.ordersCount}</TableCell>
              <TableCell className="text-muted-foreground">{customer.createdAt.slice(0, 10)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
