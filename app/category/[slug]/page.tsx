import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryListing } from "@/components/category/category-listing";
import { getCategoryBySlug } from "@/lib/categories";
import { t } from "@/lib/i18n";
import { getProductsByCategory } from "@/lib/products";

// Sets the tab title to the matched category's name
export async function generateMetadata({
  params,
}: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  return { title: category ? t(category.nameKey) : "Category" };
}

// /category/[slug] route: looks up the category by slug and lists its products
export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound(); // unknown slug -> 404

  const products = getProductsByCategory(category.id);

  return <CategoryListing category={category} products={products} />;
}