import { notFound } from "next/navigation";
import { CategoryForm } from "@/components/admin/categories/category-form";
import { getCategoryById } from "@/lib/categories";

export default async function AdminEditCategoryPage({ params }: PageProps<"/admin/categories/[id]">) {
  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category) notFound();

  return <CategoryForm category={category} />;
}
