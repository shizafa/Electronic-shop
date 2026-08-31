"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/actions/admin/guard";
import { slugify } from "@/lib/utils";
import type { VariantAxisDefinition } from "@/types/product";

// Products are fetched with lib/supabase/public.ts (no cookies), so Next.js statically
// prerenders the pages that show them. Without this, an edit would only appear after a rebuild.
function revalidateProductPaths(id: string) {
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/product/${id}`);
}

export interface ProductFormInput {
  name: string;
  brand: string;
  categoryId: string;
  description: string;
  images: string[];
  specs: Record<string, string | number | boolean>;
  variantAxes: VariantAxisDefinition[];
  featured: boolean;
}

export type ProductActionResult = { success: true; id: string } | { success: false; error: string };
export type DeleteActionResult = { success: true } | { success: false; error: string };

export async function createProduct(input: ProductFormInput): Promise<ProductActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const id = slugify(input.name);
  if (!id) return { success: false, error: "Product name can't be empty" };

  const { error } = await guard.supabase.from("products").insert({
    id,
    slug: id,
    category_id: input.categoryId,
    name: input.name,
    brand: input.brand,
    description: input.description,
    images: input.images,
    specs: input.specs,
    variant_axes: input.variantAxes,
    featured: input.featured,
  });

  if (error) {
    if (error.code === "23505") return { success: false, error: "A product with this name already exists" };
    return { success: false, error: "Failed to create product" };
  }
  revalidateProductPaths(id);
  return { success: true, id };
}

export async function updateProduct(id: string, input: ProductFormInput): Promise<ProductActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase
    .from("products")
    .update({
      category_id: input.categoryId,
      name: input.name,
      brand: input.brand,
      description: input.description,
      images: input.images,
      specs: input.specs,
      variant_axes: input.variantAxes,
      featured: input.featured,
    })
    .eq("id", id);

  if (error) return { success: false, error: "Failed to save product" };
  revalidateProductPaths(id);
  return { success: true, id };
}

export async function deleteProduct(id: string): Promise<DeleteActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from("products").delete().eq("id", id);
  if (error) {
    // FK violation: this product is still referenced by order_items (products.id has no
    // ON DELETE rule there), which is a real constraint, not a bug — surface it plainly.
    if (error.code === "23503") {
      return { success: false, error: "This product can't be deleted — it appears in past orders" };
    }
    return { success: false, error: "Failed to delete product" };
  }
  revalidateProductPaths(id);
  return { success: true };
}

export interface VariantFormInput {
  sku: string;
  axisValues: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  stock: number;
  lowStockThreshold: number;
  images?: string[];
}

// Stock/threshold come from a plain number input (no server-generated schema types in this
// project to lean on for integer coercion), so the boundary check happens here rather than
// trusting the client's HTML `min`/`step` attributes.
function validateStockFields(stock: number, lowStockThreshold: number): string | null {
  if (!Number.isInteger(stock) || stock < 0) return "Stock must be a whole number, 0 or greater";
  if (!Number.isInteger(lowStockThreshold) || lowStockThreshold < 0) {
    return "Low stock threshold must be a whole number, 0 or greater";
  }
  return null;
}

export async function createVariant(productId: string, input: VariantFormInput): Promise<ProductActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const stockError = validateStockFields(input.stock, input.lowStockThreshold);
  if (stockError) return { success: false, error: stockError };

  const id = crypto.randomUUID();
  const { error } = await guard.supabase.from("variants").insert({
    id,
    product_id: productId,
    sku: input.sku,
    axis_values: input.axisValues,
    price: input.price,
    compare_at_price: input.compareAtPrice ?? null,
    stock: input.stock,
    low_stock_threshold: input.lowStockThreshold,
    images: input.images?.length ? input.images : null,
  });

  if (error) {
    if (error.code === "23505") return { success: false, error: "A variant with this SKU already exists" };
    return { success: false, error: "Failed to create variant" };
  }
  return { success: true, id };
}

export async function updateVariant(id: string, input: VariantFormInput): Promise<ProductActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const stockError = validateStockFields(input.stock, input.lowStockThreshold);
  if (stockError) return { success: false, error: stockError };

  const { error } = await guard.supabase
    .from("variants")
    .update({
      sku: input.sku,
      axis_values: input.axisValues,
      price: input.price,
      compare_at_price: input.compareAtPrice ?? null,
      stock: input.stock,
      low_stock_threshold: input.lowStockThreshold,
      images: input.images?.length ? input.images : null,
    })
    .eq("id", id);

  if (error) return { success: false, error: "Failed to save variant" };
  return { success: true, id };
}

// Row-level quick stock edit (ProductsTable's inline popover), separate from updateVariant
// so a one-number fix doesn't require resending the rest of the variant's fields.
export async function adjustVariantStock(
  productId: string,
  variantId: string,
  stock: number
): Promise<ProductActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  if (!Number.isInteger(stock) || stock < 0) {
    return { success: false, error: "Stock must be a whole number, 0 or greater" };
  }

  const { error } = await guard.supabase.from("variants").update({ stock }).eq("id", variantId);
  if (error) return { success: false, error: "Failed to update stock" };

  revalidateProductPaths(productId);
  return { success: true, id: variantId };
}

export async function deleteVariant(id: string): Promise<DeleteActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from("variants").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      return { success: false, error: "This variant can't be deleted — it appears in past orders" };
    }
    return { success: false, error: "Failed to delete variant" };
  }
  return { success: true };
}
