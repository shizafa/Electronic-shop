import { categories } from "@/data/categories";
import type { SpecFieldDefinition } from "@/types/category";
import type { VariantAxisDefinition } from "@/types/product";

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