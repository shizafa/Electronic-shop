import { createClient } from "@/lib/supabase/public";
import { mapCategoryRow } from "@/lib/supabase/mappers";
import type { Category } from "@/types/category";

const CATEGORY_SELECT = "*, spec_fields(*)";

// Returns every product category
export async function getAllCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("categories").select(CATEGORY_SELECT);
  if (error) throw new Error(`getAllCategories: ${error.message}`);
  return (data ?? []).map(mapCategoryRow);
}

// Looks up a category by its URL-friendly slug
export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select(CATEGORY_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  return data ? mapCategoryRow(data) : undefined;
}

// Looks up a category by its id
export async function getCategoryById(id: string): Promise<Category | undefined> {
  const supabase = createClient();
  const { data } = await supabase.from("categories").select(CATEGORY_SELECT).eq("id", id).maybeSingle();
  return data ? mapCategoryRow(data) : undefined;
}
