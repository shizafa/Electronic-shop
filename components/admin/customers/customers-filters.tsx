"use client";

import { useState } from "react";
import { CalendarIcon, Search, X } from "lucide-react";
import { format } from "date-fns";
import type { DateRange as PickerDateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { t } from "@/lib/i18n";
import type { JoinedDateRange, OrderActivityFilter, RoleFilter } from "@/components/admin/customers/customers-view";

interface CustomersFiltersProps {
  query: string;
  onQueryChange: (query: string) => void;
  role: RoleFilter;
  onRoleChange: (role: RoleFilter) => void;
  roleCounts: Record<RoleFilter, number>;
  orderActivity: OrderActivityFilter;
  onOrderActivityChange: (value: OrderActivityFilter) => void;
  orderActivityCounts: Record<OrderActivityFilter, number>;
  joinedRange: JoinedDateRange | undefined;
  onJoinedRangeChange: (range: JoinedDateRange | undefined) => void;
  resultCount: number;
  onClear: () => void;
}

const ROLE_OPTIONS: { value: RoleFilter; labelKey: string }[] = [
  { value: "all", labelKey: "admin.customers.role.all" },
  { value: "admin", labelKey: "admin.customers.role.admin" },
  { value: "customer", labelKey: "admin.customers.role.customer" },
];

const ORDER_ACTIVITY_OPTIONS: { value: OrderActivityFilter; labelKey: string }[] = [
  { value: "all", labelKey: "admin.customers.orderActivity.all" },
  { value: "hasOrders", labelKey: "admin.customers.orderActivity.hasOrders" },
  { value: "noOrders", labelKey: "admin.customers.orderActivity.noOrders" },
];

export function CustomersFilters({
  query,
  onQueryChange,
  role,
  onRoleChange,
  roleCounts,
  orderActivity,
  onOrderActivityChange,
  orderActivityCounts,
  joinedRange,
  onJoinedRangeChange,
  resultCount,
  onClear,
}: CustomersFiltersProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<PickerDateRange | undefined>(
    joinedRange ? { from: joinedRange.start, to: joinedRange.end } : undefined
  );

  function handleApply() {
    if (!draftRange?.from || !draftRange?.to) return;
    onJoinedRangeChange({ start: draftRange.from, end: draftRange.to });
    setPopoverOpen(false);
  }

  function handleClearRange() {
    setDraftRange(undefined);
    onJoinedRangeChange(undefined);
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{t("admin.customers.filters")}</p>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-primary hover:underline"
        >
          {t("admin.customers.clearFilters")}
        </button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t("admin.customers.searchPlaceholder")}
          className="pl-8"
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t("admin.customers.role")}
        </p>
        {ROLE_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="customer-role"
                checked={role === option.value}
                onChange={() => onRoleChange(option.value)}
                className="size-3.5 accent-primary"
              />
              {t(option.labelKey)}
            </span>
            <span className="text-xs text-muted-foreground">{roleCounts[option.value]}</span>
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t("admin.customers.orderActivity")}
        </p>
        {ORDER_ACTIVITY_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="customer-order-activity"
                checked={orderActivity === option.value}
                onChange={() => onOrderActivityChange(option.value)}
                className="size-3.5 accent-primary"
              />
              {t(option.labelKey)}
            </span>
            <span className="text-xs text-muted-foreground">{orderActivityCounts[option.value]}</span>
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t("admin.customers.joinedDate")}
        </p>
        <div className="flex items-center gap-1.5">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="flex-1 justify-start font-normal">
                <CalendarIcon className="size-3.5" />
                {joinedRange
                  ? `${format(joinedRange.start, "MMM d, yy")} - ${format(joinedRange.end, "MMM d, yy")}`
                  : t("admin.customers.pickDateRange")}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar mode="range" selected={draftRange} onSelect={setDraftRange} numberOfMonths={1} />
              <div className="flex justify-end border-t border-border p-2">
                <Button type="button" size="sm" disabled={!draftRange?.from || !draftRange?.to} onClick={handleApply}>
                  {t("admin.customers.applyRange")}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          {joinedRange && (
            <Button type="button" variant="ghost" size="icon-sm" onClick={handleClearRange} aria-label={t("common.remove")}>
              <X className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {resultCount.toLocaleString()} {t("admin.customers.results")}
      </p>
    </div>
  );
}
