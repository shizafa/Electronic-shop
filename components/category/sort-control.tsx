"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { t } from "@/lib/i18n";
import type { SortOption } from "@/lib/filters";

const sortOptions: { value: SortOption; labelKey: string }[] = [
  { value: "featured", labelKey: "sort.featured" },
  { value: "price_asc", labelKey: "sort.priceAsc" },
  { value: "price_desc", labelKey: "sort.priceDesc" },
  { value: "name_asc", labelKey: "sort.nameAsc" },
];

interface SortControlProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

// SortControl — dropdown for choosing product sort order (featured, price, name)
export function SortControl({ value, onChange }: SortControlProps) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as SortOption)}>
      <SelectTrigger className="w-44" aria-label={t("common.sortBy")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {t(option.labelKey)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}