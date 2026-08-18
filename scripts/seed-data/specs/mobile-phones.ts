import type { SpecFieldDefinition } from "@/types/category";

// Defines the spec fields phones can have: drives filter sidebar, spec table, and compare page.
export const mobilePhoneSpecs: SpecFieldDefinition[] = [
  {
    id: "chipset",
    labelKey: "spec.chipset.label",
    type: "text",
    filterable: false,
    showInCompare: true,
  },
  {
    id: "ram",
    labelKey: "spec.ram.label",
    unit: "GB",
    type: "number",
    filterable: true,
    showInCompare: true,
  },
  {
    id: "battery",
    labelKey: "spec.battery.label",
    unit: "mAh",
    type: "number",
    filterable: false,
    showInCompare: true,
  },
  {
    id: "rearCamera",
    labelKey: "spec.rearCamera.label",
    unit: "MP",
    type: "number",
    filterable: false,
    showInCompare: true,
  },
  {
    id: "displayType",
    labelKey: "spec.displayType.label",
    type: "enum",
    options: ["AMOLED", "OLED", "IPS LCD"],
    filterable: true,
    showInCompare: true,
  },
  {
    id: "fiveGSupport",
    labelKey: "spec.fiveGSupport.label",
    type: "boolean",
    filterable: true,
    showInCompare: true,
  },
];