// The kind of value a spec field holds, used to render the right filter/input UI
export type SpecFieldType = "text" | "number" | "boolean" | "enum";

// Describes one product spec/attribute (e.g. "RAM"): its type and whether it's filterable/comparable
export interface SpecFieldDefinition {
  id: string;
  labelKey: string;
  unit?: string;
  type: SpecFieldType;
  options?: string[];
  filterable: boolean;
  showInCompare: boolean;
}

// A product category (e.g. Televisions), including which specs apply to it
export interface Category {
  id: string;
  slug: string;
  nameKey: string;
  installationRequired: boolean;
  specFields: SpecFieldDefinition[];
}
