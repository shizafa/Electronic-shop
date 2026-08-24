import { cache } from "react";
import { createClient } from "@/lib/supabase/public";
import { mapProductRow, mapVariantRow } from "@/lib/supabase/mappers";
import type { Product, Variant } from "@/types/product";

const PRODUCT_SELECT = "*, variants(*)";

// Returns every product across all categories
export const getAllProducts = cache(async (): Promise<Product[]> => {
  const supabase = createClient();
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT);
  if (error) throw new Error(`getAllProducts: ${error.message}`);
  return (data ?? []).map(mapProductRow);
});

// Looks up a product by its URL-friendly slug. Cached per-request so pages that call this from
// both generateMetadata and the page body (e.g. /product/[slug]) only hit the DB once.
export const getProductBySlug = cache(async (slug: string): Promise<Product | undefined> => {
  const supabase = createClient();
  const { data } = await supabase.from("products").select(PRODUCT_SELECT).eq("slug", slug).maybeSingle();
  return data ? mapProductRow(data) : undefined;
});

// Looks up a product by its id
export const getProductById = cache(async (productId: string): Promise<Product | undefined> => {
  const supabase = createClient();
  const { data } = await supabase.from("products").select(PRODUCT_SELECT).eq("id", productId).maybeSingle();
  return data ? mapProductRow(data) : undefined;
});

// Returns all products belonging to a category
export const getProductsByCategory = cache(async (categoryId: string): Promise<Product[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("category_id", categoryId);
  if (error) throw new Error(`getProductsByCategory: ${error.message}`);
  return (data ?? []).map(mapProductRow);
});

// Finds a specific variant (e.g. a color/size option) by id
export const getVariantById = cache(async (variantId: string): Promise<Variant | undefined> => {
  const supabase = createClient();
  const { data } = await supabase.from("variants").select("*").eq("id", variantId).maybeSingle();
  return data ? mapVariantRow(data) : undefined;
});

// Returns products flagged as featured, for homepage highlights
export const getFeaturedProducts = cache(async (): Promise<Product[]> => {
  const supabase = createClient();
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).eq("featured", true);
  if (error) throw new Error(`getFeaturedProducts: ${error.message}`);
  return (data ?? []).map(mapProductRow);
});

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
