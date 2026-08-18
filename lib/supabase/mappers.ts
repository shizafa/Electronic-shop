// Pure DB-row -> app-type mappers, shared between the server-only queries in lib/products.ts /
// lib/categories.ts and the client-side full-catalog cache in context/product-catalog-context.tsx.
// No supabase client or next/headers import here — keep this safe to import from Client Components.

import type { Category, SpecFieldDefinition } from "@/types/category";
import type { Product, Variant } from "@/types/product";

interface VariantRow {
  id: string;
  product_id: string;
  sku: string;
  axis_values: Record<string, string>;
  price: string | number;
  compare_at_price: string | number | null;
  stock: number;
  images: string[] | null;
}

interface ProductRow {
  id: string;
  slug: string;
  category_id: string;
  name: string;
  brand: string;
  description: string;
  images: string[];
  specs: Record<string, string | number | boolean>;
  variant_axes: Product["variantAxes"];
  featured: boolean;
  variants?: VariantRow[] | null;
}

interface SpecFieldRow {
  id: string;
  label_key: string;
  unit: string | null;
  type: SpecFieldDefinition["type"];
  options: string[] | null;
  filterable: boolean;
  show_in_compare: boolean;
  sort_order: number;
}

interface CategoryRow {
  id: string;
  slug: string;
  name_key: string;
  installation_required: boolean;
  spec_fields?: SpecFieldRow[] | null;
}

// numeric columns come back from PostgREST as strings (to avoid float precision loss), so every
// price field needs an explicit Number() coercion.
export function mapVariantRow(row: VariantRow): Variant {
  return {
    id: row.id,
    productId: row.product_id,
    sku: row.sku,
    axisValues: row.axis_values,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price !== null ? Number(row.compare_at_price) : undefined,
    stock: row.stock,
    images: row.images ?? undefined,
  };
}

export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    categoryId: row.category_id,
    name: row.name,
    brand: row.brand,
    description: row.description,
    images: row.images,
    specs: row.specs,
    variantAxes: row.variant_axes,
    featured: row.featured,
    variants: (row.variants ?? []).map(mapVariantRow),
  };
}

function mapSpecFieldRow(row: SpecFieldRow): SpecFieldDefinition {
  return {
    id: row.id,
    labelKey: row.label_key,
    unit: row.unit ?? undefined,
    type: row.type,
    options: row.options ?? undefined,
    filterable: row.filterable,
    showInCompare: row.show_in_compare,
  };
}

export function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    nameKey: row.name_key,
    installationRequired: row.installation_required,
    specFields: (row.spec_fields ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(mapSpecFieldRow),
  };
}
