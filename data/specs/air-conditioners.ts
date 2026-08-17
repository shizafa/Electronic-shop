import type { SpecFieldDefinition } from "@/types/category";

export const airConditionerSpecs: SpecFieldDefinition[] = [
  {
    id: "energyRating",
    labelKey: "spec.energyRating.label",
    type: "enum",
    options: ["3 Star", "4 Star", "5 Star"],
    filterable: true,
    showInCompare: true,
  },
  {
    id: "compressorType",
    labelKey: "spec.compressorType.label",
    type: "enum",
    options: ["Inverter", "Non-Inverter"],
    filterable: true,
    showInCompare: true,
  },
  {
    id: "refrigerantType",
    labelKey: "spec.refrigerantType.label",
    type: "enum",
    options: ["R32", "R410A", "R22"],
    filterable: false,
    showInCompare: true,
  },
  {
    id: "noiseLevel",
    labelKey: "spec.noiseLevel.label",
    unit: "dB",
    type: "number",
    filterable: false,
    showInCompare: true,
  },
  {
    id: "warrantyYears",
    labelKey: "spec.warrantyYears.label",
    unit: "Years",
    type: "number",
    filterable: true,
    showInCompare: true,
  },
  {
    id: "wifiEnabled",
    labelKey: "spec.wifiEnabled.label",
    type: "boolean",
    filterable: true,
    showInCompare: true,
  },
];