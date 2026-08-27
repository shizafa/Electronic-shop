import { getDisplayVariant } from "@/lib/product-helpers";
import { getSpecDefinitionsForCategory } from "@/lib/specs";
import { t } from "@/lib/i18n";
import type { Category, SpecFieldType } from "@/types/category";
import type { Product, VariantAxisDefinition } from "@/types/product";

// One selectable value within a filter, with how many products match it
export interface FilterFieldOption {
  value: string;
  count: number;
}

// A single filterable spec/attribute (e.g. "RAM") and its selectable options
export interface FilterField {
  id: string;
  label: string;
  type: SpecFieldType;
  options: FilterFieldOption[];
}

// Normalizes a spec value to a string so it can be compared/counted as a filter option
function toFilterValue(value: string | number | boolean | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

// Builds the list of filter fields (with option counts) available for a category's products
export function getFilterFieldsForCategory(category: Category, products: Product[]): FilterField[] {
  const axisDefinitions = new Map<string, VariantAxisDefinition>();
  for (const product of products) {
    for (const axis of product.variantAxes) {
      if (!axisDefinitions.has(axis.id)) axisDefinitions.set(axis.id, axis);
    }
  }

  const definitions = getSpecDefinitionsForCategory(category, Array.from(axisDefinitions.values()));

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

  return fields.filter((field) => field.options.length > 1); // hide filters with only one possible value
}

// Currently selected filter values: which options are checked, plus an optional price range
export interface ActiveFilters {
  fields: Record<string, string[]>;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
}

// Narrows a product list down to only those matching all selected filters and the price range
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

    if (filters.brand && product.brand !== filters.brand) return false;

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const price = getDisplayVariant(product).price; // use the cheapest in-stock variant's price
      if (filters.minPrice !== undefined && price < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && price > filters.maxPrice) return false;
    }

    return true;
  });
}

export type SortOption = "featured" | "price_asc" | "price_desc" | "name_asc";

// Returns a new sorted array of products according to the chosen sort option
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
      sorted.sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false)); // featured items first
      break;
  }

  return sorted;
}