// Describes one way variants of a product differ (e.g. "Storage", "Color")
export interface VariantAxisDefinition {
  id: string;
  labelKey: string;
  unit?: string;
}

// One purchasable option of a product (e.g. "128GB / Black") with its own price and stock
export interface Variant {
  id: string;
  productId: string;
  sku: string;
  axisValues: Record<string, string>;
  price: number;
  compareAtPrice?: number; // original price shown as "was X", for showing a discount
  stock: number;
  images?: string[];
}

// A catalog product; specific buyable options live in its variants
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