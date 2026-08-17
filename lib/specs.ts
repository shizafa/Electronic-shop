import { categories } from "@/data/categories";
import { t } from "@/lib/i18n";
import type { SpecFieldDefinition } from "@/types/category";
import type { Product, Variant, VariantAxisDefinition } from "@/types/product";

// Combines a category's fixed spec fields with the product's own variant axes (e.g. storage, color)
export function getSpecDefinitionsForCategory(
  categoryId: string,
  variantAxes: VariantAxisDefinition[] = []
): SpecFieldDefinition[] {
  const category = categories.find((candidate) => candidate.id === categoryId);

  // Variant axes act like extra filterable/comparable spec fields
  const axisFields: SpecFieldDefinition[] = variantAxes.map((axis) => ({
    id: axis.id,
    labelKey: axis.labelKey,
    unit: axis.unit,
    type: "text",
    filterable: true,
    showInCompare: true,
  }));

  return [...axisFields, ...(category?.specFields ?? [])];
}

// One row in a spec comparison table: a label plus one value per compared product
export interface SpecRow {
  id: string;
  label: string;
  values: (string | number | boolean | undefined)[];
}

// Builds the rows for a side-by-side spec comparison table (used on the compare page)
export function buildSpecRows(entries: { product: Product; variant: Variant }[]): SpecRow[] {
  if (entries.length === 0) return [];

  const { product: firstProduct } = entries[0];
  const definitions = getSpecDefinitionsForCategory(firstProduct.categoryId, firstProduct.variantAxes);

  return definitions.map((definition) => ({
    id: definition.id,
    label: `${t(definition.labelKey)}${definition.unit ? ` (${definition.unit})` : ""}`,
    values: entries.map(({ product, variant }) => {
      // Prefer the variant's own value for this field, falling back to the product-level spec
      const axisValue = variant.axisValues[definition.id];
      return axisValue !== undefined ? axisValue : product.specs[definition.id];
    }),
  }));
}

// Formats a spec value for display: booleans become yes/no, missing values become an em dash
export function formatSpecValue(value: string | number | boolean | undefined): string {
  if (value === undefined) return "—";
  if (typeof value === "boolean") return value ? t("common.yes") : t("common.no");
  return String(value);
}