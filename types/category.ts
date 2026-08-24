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

// A product category (e.g. Televisions), including which specs apply to it and everything
// needed to display it on the storefront (homepage tiles, nav, category page)
export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  thumbnailUrl: string | null;
  bannerUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  installationRequired: boolean;
  specFields: SpecFieldDefinition[];
}
