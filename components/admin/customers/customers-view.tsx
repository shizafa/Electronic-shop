"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { endOfDay, isWithinInterval, startOfDay, startOfMonth } from "date-fns";
import { CustomersFilters } from "@/components/admin/customers/customers-filters";
import { CustomersTable } from "@/components/admin/customers/customers-table";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import type { AdminCustomerSummary } from "@/lib/admin/customers";

interface CustomersViewProps {
  customers: AdminCustomerSummary[];
}

export type RoleFilter = "all" | "admin" | "customer";
export type OrderActivityFilter = "all" | "hasOrders" | "noOrders";
export interface JoinedDateRange {
  start: Date;
  end: Date;
}

const PAGE_SIZE = 20;

export function CustomersView({ customers }: CustomersViewProps) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [orderActivity, setOrderActivity] = useState<OrderActivityFilter>("all");
  const [joinedRange, setJoinedRange] = useState<JoinedDateRange | undefined>();
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [page, setPage] = useState(1);

  const stats = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    return {
      total: customers.length,
      admins: customers.filter((customer) => customer.isAdmin).length,
      withOrders: customers.filter((customer) => customer.ordersCount > 0).length,
      newThisMonth: customers.filter((customer) => new Date(customer.createdAt) >= monthStart).length,
    };
  }, [customers]);

  // Counts shown next to each radio option reflect the OTHER active filters (search, and the
  // sibling filter group) so the numbers stay meaningful as the admin narrows down, but not
  // the filter's own dimension (so e.g. every role option's count updates together).
  const searchedCustomers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return customers;
    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(normalizedQuery) || customer.email.toLowerCase().includes(normalizedQuery)
    );
  }, [customers, query]);

  const byOrderActivity = useMemo(
    () => searchedCustomers.filter((customer) => matchesOrderActivity(customer, orderActivity)),
    [searchedCustomers, orderActivity]
  );
  const byJoinedRange = useMemo(
    () => byOrderActivity.filter((customer) => matchesJoinedRange(customer, joinedRange)),
    [byOrderActivity, joinedRange]
  );

  const roleCounts = useMemo(
    () => ({
      all: byJoinedRange.length,
      admin: byJoinedRange.filter((customer) => customer.isAdmin).length,
      customer: byJoinedRange.filter((customer) => !customer.isAdmin).length,
    }),
    [byJoinedRange]
  );

  const beforeOrderActivity = useMemo(
    () =>
      searchedCustomers
        .filter((customer) => matchesRole(customer, role))
        .filter((customer) => matchesJoinedRange(customer, joinedRange)),
    [searchedCustomers, role, joinedRange]
  );
  const orderActivityCounts = useMemo(
    () => ({
      all: beforeOrderActivity.length,
      hasOrders: beforeOrderActivity.filter((customer) => customer.ordersCount > 0).length,
      noOrders: beforeOrderActivity.filter((customer) => customer.ordersCount === 0).length,
    }),
    [beforeOrderActivity]
  );

  const filteredCustomers = useMemo(
    () => byJoinedRange.filter((customer) => matchesRole(customer, role)),
    [byJoinedRange, role]
  );

  const total = filteredCustomers.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(currentPage * PAGE_SIZE, total);
  const pageItems = filteredCustomers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const filterKey = JSON.stringify([query, role, orderActivity, joinedRange]);
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  function clearFilters() {
    setQuery("");
    setRole("all");
    setOrderActivity("all");
    setJoinedRange(undefined);
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t("admin.customers.heading")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("admin.customers.subtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <StatChip labelKey="admin.customers.total" value={stats.total} dotClassName="bg-muted-foreground" />
        <StatChip labelKey="admin.customers.admins" value={stats.admins} dotClassName="bg-chart-1" />
        <StatChip labelKey="admin.customers.withOrders" value={stats.withOrders} dotClassName="bg-status-good" />
        <StatChip labelKey="admin.customers.newThisMonth" value={stats.newThisMonth} dotClassName="bg-chart-3" />
      </div>

      <div className={`grid grid-cols-1 gap-4 ${filtersOpen ? "lg:grid-cols-[260px_1fr]" : ""}`}>
        {filtersOpen && (
          <CustomersFilters
            query={query}
            onQueryChange={setQuery}
            role={role}
            onRoleChange={setRole}
            roleCounts={roleCounts}
            orderActivity={orderActivity}
            onOrderActivityChange={setOrderActivity}
            orderActivityCounts={orderActivityCounts}
            joinedRange={joinedRange}
            onJoinedRangeChange={setJoinedRange}
            resultCount={total}
            onClear={clearFilters}
          />
        )}

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setFiltersOpen((current) => !current)}>
              <SlidersHorizontal className="size-4" />
              {t(filtersOpen ? "admin.customers.hideFilters" : "admin.customers.showFilters")}
            </Button>
            {total > 0 && (
              <p className="text-sm text-muted-foreground">
                {t("admin.customers.showingResults")
                  .replace("{from}", String(pageStart))
                  .replace("{to}", String(pageEnd))
                  .replace("{total}", String(total))}
              </p>
            )}
          </div>

          <CustomersTable customers={pageItems} />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                {t("admin.customers.previous")}
              </Button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  size="icon-sm"
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              >
                {t("admin.customers.next")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function matchesRole(customer: AdminCustomerSummary, role: RoleFilter): boolean {
  if (role === "admin") return customer.isAdmin;
  if (role === "customer") return !customer.isAdmin;
  return true;
}

function matchesOrderActivity(customer: AdminCustomerSummary, filter: OrderActivityFilter): boolean {
  if (filter === "hasOrders") return customer.ordersCount > 0;
  if (filter === "noOrders") return customer.ordersCount === 0;
  return true;
}

function matchesJoinedRange(customer: AdminCustomerSummary, range: JoinedDateRange | undefined): boolean {
  if (!range) return true;
  return isWithinInterval(new Date(customer.createdAt), { start: startOfDay(range.start), end: endOfDay(range.end) });
}

function StatChip({ labelKey, value, dotClassName }: { labelKey: string; value: number; dotClassName: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm">
      <span className={`size-1.5 rounded-full ${dotClassName}`} />
      <span className="text-muted-foreground">{t(labelKey)}</span>
      <span className="font-semibold text-foreground">{value.toLocaleString()}</span>
    </div>
  );
}
