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
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).eq("slug", slug).maybeSingle();
  if (error) throw new Error(`getProductBySlug: ${error.message}`);
  return data ? mapProductRow(data) : undefined;
});

// Looks up a product by its id
export const getProductById = cache(async (productId: string): Promise<Product | undefined> => {
  const supabase = createClient();
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).eq("id", productId).maybeSingle();
  if (error) throw new Error(`getProductById: ${error.message}`);
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
  const { data, error } = await supabase.from("variants").select("*").eq("id", variantId).maybeSingle();
  if (error) throw new Error(`getVariantById: ${error.message}`);
  return data ? mapVariantRow(data) : undefined;
});

// Looks up several variants at once (cart/wishlist lines) in a single query, so a basket of N
// items costs one request instead of N. Ids with no matching row are simply absent from the
// result — callers decide what a missing variant means.
export async function getVariantsByIds(variantIds: string[]): Promise<Variant[]> {
  if (variantIds.length === 0) return [];
  const supabase = createClient();
  const { data, error } = await supabase.from("variants").select("*").in("id", variantIds);
  if (error) throw new Error(`getVariantsByIds: ${error.message}`);
  return (data ?? []).map(mapVariantRow);
}

// Returns products flagged as featured, for homepage highlights
export const getFeaturedProducts = cache(async (): Promise<Product[]> => {
  const supabase = createClient();
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).eq("featured", true);
  if (error) throw new Error(`getFeaturedProducts: ${error.message}`);
  return (data ?? []).map(mapProductRow);
});

// Case-insensitive search across product name and brand, optionally scoped to one category
export async function searchProducts(query: string, categoryId?: string): Promise<Product[]> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  const supabase = createClient();
  const escaped = normalizedQuery.replace(/[%,]/g, ""); // strip characters that would break the PostgREST or-filter syntax
  let queryBuilder = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .or(`name.ilike.%${escaped}%,brand.ilike.%${escaped}%`);
  if (categoryId) {
    queryBuilder = queryBuilder.eq("category_id", categoryId);
  }
  const { data, error } = await queryBuilder;
  if (error) throw new Error(`searchProducts: ${error.message}`);
  return (data ?? []).map(mapProductRow);
}
