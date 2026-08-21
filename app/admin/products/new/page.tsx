import { ProductForm } from "@/components/admin/products/product-form";
import { getAllCategories } from "@/lib/categories";

export default async function AdminNewProductPage() {
  const categories = await getAllCategories();
  return <ProductForm categories={categories} />;
}