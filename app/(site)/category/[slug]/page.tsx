import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryListing } from "@/components/category/category-listing";
import { getAllCategories, getCategoryBySlug } from "@/lib/categories";
import { getAllProducts, getProductsByCategory } from "@/lib/products";

// Sets the tab title to the matched category's name
export async function generateMetadata({
  params,
}: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category ? category.name : "Category" };
}

// /category/[slug] route: looks up the category by slug and lists its products
export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category || !category.isActive) notFound(); // unknown or hidden slug -> 404

  const [products, allCategories, allProducts] = await Promise.all([
    getProductsByCategory(category.id),
    getAllCategories(),
    getAllProducts(),
  ]);

  return (
    <CategoryListing category={category} products={products} allCategories={allCategories} allProducts={allProducts} />
  );
}