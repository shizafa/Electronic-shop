export interface VariantAxisDefinition {
  id: string;
  labelKey: string;
  unit?: string;
}

export interface Variant {
  id: string;
  productId: string;
  sku: string;
  axisValues: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images?: string[];
}

export interface Product {
  id: string;
  slug: string;
  categoryId: string;
  name: string;
  brand: string;
  description: string;
  images: string[];
  specs: Record<string, string | number | boolean>;
  variantAxes: VariantAxisDefinition[];
  variants: Variant[];
  featured?: boolean;
}