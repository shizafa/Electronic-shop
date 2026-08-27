"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/actions/admin/guard";
import { slugify } from "@/lib/utils";
import type { SpecFieldType } from "@/types/category";

// Categories/products are fetched with lib/supabase/public.ts (no cookies), so Next.js statically
// prerenders the pages that show them. Without this, an edit would only appear after a rebuild.
function revalidateCategoryPaths(id: string) {
  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}`);
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/category/${id}`);
}

export interface CategoryFormInput {
  name: string;
  description: string;
  thumbnailUrl: string | null;
  bannerUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  installationRequired: boolean;
}

export type CategoryActionResult = { success: true; id: string } | { success: false; error: string };
export type DeleteActionResult = { success: true } | { success: false; error: string };

export async function createCategory(input: CategoryFormInput): Promise<CategoryActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const id = slugify(input.name);
  if (!id) return { success: false, error: "Category name can't be empty" };

  const { error } = await guard.supabase.from("categories").insert({
    id,
    slug: id,
    name: input.name,
    description: input.description,
    thumbnail_url: input.thumbnailUrl,
    banner_url: input.bannerUrl,
    is_active: input.isActive,
    display_order: input.displayOrder,
    installation_required: input.installationRequired,
  });

  if (error) {
    if (error.code === "23505") return { success: false, error: "A category with this name already exists" };
    return { success: false, error: "Failed to create category" };
  }
  revalidateCategoryPaths(id);
  return { success: true, id };
}

export async function updateCategory(id: string, input: CategoryFormInput): Promise<CategoryActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase
    .from("categories")
    .update({
      name: input.name,
      description: input.description,
      thumbnail_url: input.thumbnailUrl,
      banner_url: input.bannerUrl,
      is_active: input.isActive,
      display_order: input.displayOrder,
      installation_required: input.installationRequired,
    })
    .eq("id", id);

  if (error) return { success: false, error: "Failed to save category" };
  revalidateCategoryPaths(id);
  return { success: true, id };
}

export async function deleteCategory(id: string): Promise<DeleteActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from("categories").delete().eq("id", id);
  if (error) {
    // FK violation: products.category_id still points at this category — a real constraint,
    // not a bug, so surface it plainly (same pattern as deleteProduct).
    if (error.code === "23503") {
      return { success: false, error: "This category can't be deleted — it still has products" };
    }
    return { success: false, error: "Failed to delete category" };
  }
  revalidateCategoryPaths(id);
  return { success: true };
}

export interface SpecFieldFormInput {
  label: string;
  unit?: string;
  type: SpecFieldType;
  options?: string[];
  filterable: boolean;
  showInCompare: boolean;
  sortOrder: number;
}

export async function createSpecField(
  categoryId: string,
  input: SpecFieldFormInput
): Promise<CategoryActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const id = slugify(input.label);
  if (!id) return { success: false, error: "Spec field label can't be empty" };

  const { error } = await guard.supabase.from("spec_fields").insert({
    id,
    category_id: categoryId,
    label_key: input.label,
    unit: input.unit || null,
    type: input.type,
    options: input.options ?? null,
    filterable: input.filterable,
    show_in_compare: input.showInCompare,
    sort_order: input.sortOrder,
  });

  if (error) {
    if (error.code === "23505") return { success: false, error: "A spec field with this label already exists" };
    return { success: false, error: "Failed to create spec field" };
  }
  return { success: true, id };
}

export async function updateSpecField(
  categoryId: string,
  id: string,
  input: SpecFieldFormInput
): Promise<CategoryActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase
    .from("spec_fields")
    .update({
      label_key: input.label,
      unit: input.unit || null,
      type: input.type,
      options: input.options ?? null,
      filterable: input.filterable,
      show_in_compare: input.showInCompare,
      sort_order: input.sortOrder,
    })
    .eq("category_id", categoryId)
    .eq("id", id);

  if (error) return { success: false, error: "Failed to save spec field" };
  return { success: true, id };
}

export async function deleteSpecField(categoryId: string, id: string): Promise<DeleteActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { error } = await guard.supabase.from("spec_fields").delete().eq("category_id", categoryId).eq("id", id);
  if (error) return { success: false, error: "Failed to delete spec field" };
  return { success: true };
}
