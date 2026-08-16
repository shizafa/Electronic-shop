export type SpecFieldType = "text" | "number" | "boolean" | "enum";

export interface SpecFieldDefinition {
  id: string;
  labelKey: string;
  unit?: string;
  type: SpecFieldType;
  options?: string[];
  filterable: boolean;
  showInCompare: boolean;
}

export interface Category {
  id: string;
  slug: string;
  nameKey: string;
  installationRequired: boolean;
  specFields: SpecFieldDefinition[];
}
