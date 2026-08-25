"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import type { DateRange as PickerDateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { t } from "@/lib/i18n";
import type { DashboardPeriod, DateRange } from "@/lib/admin/dashboard-filters";

interface PeriodFilterProps {
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
  customRange: DateRange | undefined;
  onCustomRangeChange: (range: DateRange) => void;
}

const OPTIONS: { value: Exclude<DashboardPeriod, "custom">; labelKey: string }[] = [
  { value: "week", labelKey: "admin.overview.periodWeek" },
  { value: "month", labelKey: "admin.overview.periodMonth" },
  { value: "year", labelKey: "admin.overview.periodYear" },
];

// Week/Month/Year/Custom filter control shared by the Sales Statistics and Order Status
// widgets. Each widget renders its own instance with its own state — they don't share a filter.
export function PeriodFilter({ period, onPeriodChange, customRange, onCustomRangeChange }: PeriodFilterProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<PickerDateRange | undefined>(
    customRange ? { from: customRange.start, to: customRange.end } : undefined
  );

  function handleApply() {
    if (!draftRange?.from || !draftRange?.to) return;
    onCustomRangeChange({ start: draftRange.from, end: draftRange.to });
    onPeriodChange("custom");
    setPopoverOpen(false);
  }

  return (
    <div className="flex items-center gap-1">
      {OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={period === option.value ? "default" : "ghost"}
          onClick={() => onPeriodChange(option.value)}
        >
          {t(option.labelKey)}
        </Button>
      ))}

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="icon-sm"
            variant={period === "custom" ? "default" : "ghost"}
            aria-label={t("admin.overview.pickDateRange")}
          >
            <CalendarIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto p-0">
          <Calendar
            mode="range"
            selected={draftRange}
            onSelect={setDraftRange}
            numberOfMonths={2}
            defaultMonth={draftRange?.from ?? customRange?.start}
          />
          <div className="flex justify-end border-t border-border p-2">
            <Button type="button" size="sm" disabled={!draftRange?.from || !draftRange?.to} onClick={handleApply}>
              {t("admin.overview.applyRange")}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
