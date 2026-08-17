import { categories } from "@/data/categories";
import { t } from "@/lib/i18n";
import type { SpecFieldDefinition } from "@/types/category";
import type { Product, Variant, VariantAxisDefinition } from "@/types/product";

export function getSpecDefinitionsForCategory(
  categoryId: string,
  variantAxes: VariantAxisDefinition[] = []
): SpecFieldDefinition[] {
  const category = categories.find((candidate) => candidate.id === categoryId);

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

export interface SpecRow {
  id: string;
  label: string;
  values: (string | number | boolean | undefined)[];
}

export function buildSpecRows(entries: { product: Product; variant: Variant }[]): SpecRow[] {
  if (entries.length === 0) return [];

  const { product: firstProduct } = entries[0];
  const definitions = getSpecDefinitionsForCategory(firstProduct.categoryId, firstProduct.variantAxes);

  return definitions.map((definition) => ({
    id: definition.id,
    label: `${t(definition.labelKey)}${definition.unit ? ` (${definition.unit})` : ""}`,
    values: entries.map(({ product, variant }) => {
      const axisValue = variant.axisValues[definition.id];
      return axisValue !== undefined ? axisValue : product.specs[definition.id];
    }),
  }));
}

export function formatSpecValue(value: string | number | boolean | undefined): string {
  if (value === undefined) return "—";
  if (typeof value === "boolean") return value ? t("common.yes") : t("common.no");
  return String(value);
}