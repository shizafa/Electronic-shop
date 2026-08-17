import { categories } from "@/data/categories";
import type { Category } from "@/types/category";

// Returns every product category (mock data, no backend)
export function getAllCategories(): Category[] {
  return categories;
}

// Looks up a category by its URL-friendly slug
export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

// Looks up a category by its id
export function getCategoryById(id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}