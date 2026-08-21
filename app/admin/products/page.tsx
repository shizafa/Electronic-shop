import { ProductsView } from "@/components/admin/products/products-view";
import { getAllCategories } from "@/lib/categories";
import { getAllProducts } from "@/lib/products";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getAllProducts(), getAllCategories()]);
  return <ProductsView products={products} categories={categories} />;
}
