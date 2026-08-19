"use client";

import { useMemo, useState } from "react";
import { CustomersTable } from "@/components/admin/customers/customers-table";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import type { AdminCustomerSummary } from "@/lib/admin/customers";

interface CustomersViewProps {
  customers: AdminCustomerSummary[];
}

export function CustomersView({ customers }: CustomersViewProps) {
  const [query, setQuery] = useState("");

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return customers;
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(normalizedQuery) ||
        customer.email.toLowerCase().includes(normalizedQuery)
    );
  }, [customers, query]);

  return (
    <div className="flex flex-col gap-4">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("admin.customers.searchPlaceholder")}
        className="sm:max-w-xs"
      />
      <CustomersTable customers={filteredCustomers} />
    </div>
  );
}
