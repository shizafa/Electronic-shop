import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/products/product-form";
import { getAllCategories } from "@/lib/categories";
import { getProductById } from "@/lib/products";

export default async function AdminEditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductById(id), getAllCategories()]);
  if (!product) notFound();

  return <ProductForm categories={categories} product={product} />;
}