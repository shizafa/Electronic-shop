import type { SpecFieldDefinition } from "@/types/category";

export const televisionSpecs: SpecFieldDefinition[] = [
  {
    id: "screenResolution",
    labelKey: "spec.screenResolution.label",
    type: "enum",
    options: ["HD", "Full HD", "4K Ultra HD", "8K"],
    filterable: true,
    showInCompare: true,
  },
  {
    id: "refreshRate",
    labelKey: "spec.refreshRate.label",
    unit: "Hz",
    type: "number",
    filterable: true,
    showInCompare: true,
  },
  {
    id: "panelType",
    labelKey: "spec.panelType.label",
    type: "enum",
    options: ["LED", "QLED", "OLED"],
    filterable: true,
    showInCompare: true,
  },
  {
    id: "smartOs",
    labelKey: "spec.smartOs.label",
    type: "enum",
    options: ["Android TV", "Google TV", "Tizen", "WebOS", "None"],
    filterable: true,
    showInCompare: true,
  },
  {
    id: "hdmiPorts",
    labelKey: "spec.hdmiPorts.label",
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
];