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
      const price = getDisplayVariant(product)?.price; // use the cheapest in-stock variant's price
      if (price === undefined) return false; // no variants at all — can't match a price range
      if (filters.minPrice !== undefined && price < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && price > filters.maxPrice) return false;
    }

    return true;
  });
}

// Approximate definitions for /shop's "Fast Filter" chips (components/shop/shop-toolbar.tsx's
// FAST_FILTERS ids). Only "featured" has a real product field behind it — the schema has no
// sales-count, and no distinct "top items" concept — so the rest use the closest available
// proxy from real data (rating, review count, creation date), which means some of these
// overlap by design:
//   - bestSellers: same set as featured — no separate sales-count field to rank by
//   - topRated: average rating at or above TOP_RATED_THRESHOLD
//   - new: the newest NEW_FRACTION slice of the catalog by creation date
//   - topItems: topRated ∩ popularItem — highly rated AND actually reviewed
//   - popularItem: has at least one review
const TOP_RATED_THRESHOLD = 4;
const NEW_FRACTION = 0.25;

function computeNewProductIds(products: Product[]): Set<string> {
  const sorted = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const cutoff = Math.max(1, Math.ceil(sorted.length * NEW_FRACTION));
  return new Set(sorted.slice(0, cutoff).map((product) => product.id));
}

// Narrows to products matching at least one of the active fast-filter chips (OR across chips,
// same as the sidebar's checklist widgets treat multiple checked options within one field).
export function applyFastFilters(products: Product[], activeIds: string[]): Product[] {
  if (activeIds.length === 0) return products;

  const newProductIds = activeIds.includes("new") ? computeNewProductIds(products) : undefined;

  return products.filter((product) =>
    activeIds.some((id) => {
      switch (id) {
        case "featured":
        case "bestSellers":
          return Boolean(product.featured);
        case "topRated":
          return product.averageRating >= TOP_RATED_THRESHOLD;
        case "popularItem":
          return product.reviewCount >= 1;
        case "topItems":
          return product.averageRating >= TOP_RATED_THRESHOLD && product.reviewCount >= 1;
        case "new":
          return newProductIds?.has(product.id) ?? false;
        default:
          return false;
      }
    })
  );
}

export type SortOption = "featured" | "price_asc" | "price_desc" | "name_asc";

// Returns a new sorted array of products according to the chosen sort option
export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  const priceOf = (product: Product) => getDisplayVariant(product)?.price;
  // Products with no variants at all have no price to sort by — sink them to the end
  // regardless of direction, rather than letting them jump to the top of a descending sort.
  function comparePrices(a: Product, b: Product, ascending: boolean): number {
    const priceA = priceOf(a);
    const priceB = priceOf(b);
    if (priceA === undefined) return priceB === undefined ? 0 : 1;
    if (priceB === undefined) return -1;
    return ascending ? priceA - priceB : priceB - priceA;
  }

  switch (sort) {
    case "price_asc":
      sorted.sort((a, b) => comparePrices(a, b, true));
      break;
    case "price_desc":
      sorted.sort((a, b) => comparePrices(a, b, false));
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