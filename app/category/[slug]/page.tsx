import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryListing } from "@/components/category/category-listing";
import { getCategoryBySlug } from "@/lib/categories";
import { t } from "@/lib/i18n";
import { getProductsByCategory } from "@/lib/products";

export async function generateMetadata({
  params,
}: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  return { title: category ? t(category.nameKey) : "Category" };
}

export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const products = getProductsByCategory(category.id);

  return <CategoryListing category={category} products={products} />;
}