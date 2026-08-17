import { getDisplayVariant } from "@/lib/products";
import { getSpecDefinitionsForCategory } from "@/lib/specs";
import { t } from "@/lib/i18n";
import type { Category, SpecFieldType } from "@/types/category";
import type { Product, VariantAxisDefinition } from "@/types/product";

export interface FilterFieldOption {
  value: string;
  count: number;
}

export interface FilterField {
  id: string;
  label: string;
  type: SpecFieldType;
  options: FilterFieldOption[];
}

function toFilterValue(value: string | number | boolean | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

export function getFilterFieldsForCategory(category: Category, products: Product[]): FilterField[] {
  const axisDefinitions = new Map<string, VariantAxisDefinition>();
  for (const product of products) {
    for (const axis of product.variantAxes) {
      if (!axisDefinitions.has(axis.id)) axisDefinitions.set(axis.id, axis);
    }
  }

  const definitions = getSpecDefinitionsForCategory(category.id, Array.from(axisDefinitions.values()));

  const fields = definitions
    .filter((definition) => definition.filterable)
    .map((definition) => {
      const isAxisField = axisDefinitions.has(definition.id);
      const valueCounts = new Map<string, number>();

      for (const product of products) {
        const rawValues = isAxisField
          ? Array.from(new Set(product.variants.map((variant) => variant.axisValues[definition.id])))
          : [toFilterValue(product.specs[definition.id])];

        for (const rawValue of rawValues) {
          if (rawValue === undefined) continue;
          valueCounts.set(rawValue, (valueCounts.get(rawValue) ?? 0) + 1);
        }
      }

      const field: FilterField = {
        id: definition.id,
        label: t(definition.labelKey),
        type: definition.type,
        options: Array.from(valueCounts.entries()).map(([value, count]) => ({ value, count })),
      };
      return field;
    });

  return fields.filter((field) => field.options.length > 1);
}

export interface ActiveFilters {
  fields: Record<string, string[]>;
  minPrice?: number;
  maxPrice?: number;
}

export function applyFilters(products: Product[], filters: ActiveFilters): Product[] {
  return products.filter((product) => {
    for (const [fieldId, selectedValues] of Object.entries(filters.fields)) {
      if (selectedValues.length === 0) continue;

      const isAxisField = product.variantAxes.some((axis) => axis.id === fieldId);
      const matches = isAxisField
        ? product.variants.some((variant) => selectedValues.includes(variant.axisValues[fieldId]))
        : selectedValues.includes(toFilterValue(product.specs[fieldId]) ?? "");

      if (!matches) return false;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const price = getDisplayVariant(product).price;
      if (filters.minPrice !== undefined && price < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && price > filters.maxPrice) return false;
    }

    return true;
  });
}

export type SortOption = "featured" | "price_asc" | "price_desc" | "name_asc";

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];

  switch (sort) {
    case "price_asc":
      sorted.sort((a, b) => getDisplayVariant(a).price - getDisplayVariant(b).price);
      break;
    case "price_desc":
      sorted.sort((a, b) => getDisplayVariant(b).price - getDisplayVariant(a).price);
      break;
    case "name_asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "featured":
    default:
      sorted.sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
      break;
  }

  return sorted;
}