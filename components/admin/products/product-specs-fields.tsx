"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { t } from "@/lib/i18n";
import type { SpecFieldDefinition } from "@/types/category";

interface ProductSpecsFieldsProps {
  specFields: SpecFieldDefinition[];
  specs: Record<string, string | number | boolean>;
  onChange: (specs: Record<string, string | number | boolean>) => void;
}

// Renders one input per spec field defined on the product's category — the same
// specFields that drive the storefront's filter sidebar and comparison table.
export function ProductSpecsFields({ specFields, specs, onChange }: ProductSpecsFieldsProps) {
  function setValue(fieldId: string, value: string | number | boolean) {
    onChange({ ...specs, [fieldId]: value });
  }

  if (specFields.length === 0) {
    return <p className="text-sm text-muted-foreground">This category has no spec fields defined yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {specFields.map((field) => {
        const value = specs[field.id];
        const label = t(field.labelKey) + (field.unit ? ` (${field.unit})` : "");

        if (field.type === "boolean") {
          return (
            <label key={field.id} className="flex items-center gap-2 text-sm font-medium">
              <Checkbox checked={Boolean(value)} onCheckedChange={(checked) => setValue(field.id, checked === true)} />
              {label}
            </label>
          );
        }

        if (field.type === "enum") {
          return (
            <div key={field.id} className="flex flex-col gap-1.5">
              <Label>{label}</Label>
              <Select value={String(value ?? "")} onValueChange={(next) => setValue(field.id, next)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={label} />
                </SelectTrigger>
                <SelectContent>
                  {(field.options ?? []).map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        return (
          <div key={field.id} className="flex flex-col gap-1.5">
            <Label htmlFor={`spec-${field.id}`}>{label}</Label>
            <Input
              id={`spec-${field.id}`}
              type={field.type === "number" ? "number" : "text"}
              value={String(value ?? "")}
              onChange={(event) =>
                setValue(field.id, field.type === "number" ? Number(event.target.value) : event.target.value)
              }
            />
          </div>
        );
      })}
    </div>
  );
}
