"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import type { FilterField } from "@/lib/filters";
import type { SpecFieldType } from "@/types/category";

function formatOptionLabel(value: string, type: SpecFieldType): string {
  if (type === "boolean") return value === "true" ? t("common.yes") : t("common.no");
  return value;
}

interface FilterSidebarProps {
  fields: FilterField[];
  activeFieldValues: Record<string, string[]>;
  onToggleFieldValue: (fieldId: string, value: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onClearAll: () => void;
}

// FilterSidebar — checkbox/price-range filter controls, shared by the desktop sidebar and mobile drawer
export function FilterSidebar({
  fields,
  activeFieldValues,
  onToggleFieldValue,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onClearAll,
}: FilterSidebarProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{t("common.filters")}</p>
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-medium text-primary hover:underline"
        >
          {t("common.clearFilters")}
        </button>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">{t("common.priceRange")}</p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={t("common.min")}
            value={minPrice}
            onChange={(event) => onMinPriceChange(event.target.value)}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={t("common.max")}
            value={maxPrice}
            onChange={(event) => onMaxPriceChange(event.target.value)}
          />
        </div>
      </div>

      {fields.map((field) => (
        <div key={field.id}>
          <p className="mb-2 text-sm font-medium text-foreground">{field.label}</p>
          <div className="flex flex-col gap-2">
            {field.options.map((option) => {
              const isChecked = activeFieldValues[field.id]?.includes(option.value) ?? false;
              return (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => onToggleFieldValue(field.id, option.value)}
                  />
                  <span>{formatOptionLabel(option.value, field.type)}</span>
                  <span className="text-xs text-muted-foreground">({option.count})</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}