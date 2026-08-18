import { createClient } from "@/lib/supabase/public";
import { mapProductRow, mapVariantRow } from "@/lib/supabase/mappers";
import type { Product, Variant } from "@/types/product";

const PRODUCT_SELECT = "*, variants(*)";

// Returns every product across all categories
export async function getAllProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT);
  if (error) throw new Error(`getAllProducts: ${error.message}`);
  return (data ?? []).map(mapProductRow);
}

// Looks up a product by its URL-friendly slug
export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const supabase = createClient();
  const { data } = await supabase.from("products").select(PRODUCT_SELECT).eq("slug", slug).maybeSingle();
  return data ? mapProductRow(data) : undefined;
}

// Looks up a product by its id
export async function getProductById(productId: string): Promise<Product | undefined> {
  const supabase = createClient();
  const { data } = await supabase.from("products").select(PRODUCT_SELECT).eq("id", productId).maybeSingle();
  return data ? mapProductRow(data) : undefined;
}

// Returns all products belonging to a category
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("category_id", categoryId);
  if (error) throw new Error(`getProductsByCategory: ${error.message}`);
  return (data ?? []).map(mapProductRow);
}

// Finds a specific variant (e.g. a color/size option) by id
export async function getVariantById(variantId: string): Promise<Variant | undefined> {
  const supabase = createClient();
  const { data } = await supabase.from("variants").select("*").eq("id", variantId).maybeSingle();
  return data ? mapVariantRow(data) : undefined;
}

// Returns products flagged as featured, for homepage highlights
export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).eq("featured", true);
  if (error) throw new Error(`getFeaturedProducts: ${error.message}`);
  return (data ?? []).map(mapProductRow);
}

// Case-insensitive search across product name and brand
export async function searchProducts(query: string): Promise<Product[]> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  const supabase = createClient();
  const escaped = normalizedQuery.replace(/[%,]/g, ""); // strip characters that would break the PostgREST or-filter syntax
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .or(`name.ilike.%${escaped}%,brand.ilike.%${escaped}%`);
  if (error) throw new Error(`searchProducts: ${error.message}`);
  return (data ?? []).map(mapProductRow);
}
