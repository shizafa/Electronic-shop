import Link from "next/link";
import { Plus } from "lucide-react";
import { CategoriesTable } from "@/components/admin/categories/categories-table";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { getAllCategories } from "@/lib/categories";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="size-4" />
            {t("admin.categories.newCategory")}
          </Link>
        </Button>
      </div>
      <CategoriesTable categories={categories} />
    </div>
  );
}
