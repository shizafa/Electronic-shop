import Image from "next/image";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { t } from "@/lib/i18n";
import type { Category } from "@/types/category";

interface CategoriesTableProps {
  categories: Category[];
}

export function CategoriesTable({ categories }: CategoriesTableProps) {
  if (categories.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">{t("admin.categories.noCategories")}</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("admin.categories.category")}</TableHead>
          <TableHead>{t("admin.categories.slug")}</TableHead>
          <TableHead>{t("admin.categories.status")}</TableHead>
          <TableHead>{t("admin.categories.installation")}</TableHead>
          <TableHead>{t("admin.categories.specFields")}</TableHead>
          <TableHead className="text-end">{t("admin.products.actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell>
              <Link href={`/admin/categories/${category.id}`} className="flex items-center gap-3 font-medium hover:underline">
                <span className="relative size-8 shrink-0 overflow-hidden rounded-md bg-muted">
                  {category.thumbnailUrl && (
                    <Image src={category.thumbnailUrl} alt="" fill sizes="32px" className="object-cover" />
                  )}
                </span>
                {category.name}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground">{category.slug}</TableCell>
            <TableCell>
              {category.isActive ? (
                <Badge variant="secondary">{t("admin.categories.active")}</Badge>
              ) : (
                <Badge variant="outline">{t("admin.categories.inactive")}</Badge>
              )}
            </TableCell>
            <TableCell>
              {category.installationRequired ? (
                <Badge variant="secondary">{t("common.yes")}</Badge>
              ) : (
                <span className="text-muted-foreground">{t("common.no")}</span>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">{category.specFields.length}</TableCell>
            <TableCell className="text-end">
              <Button variant="ghost" size="icon-sm" asChild aria-label={t("admin.products.edit")}>
                <Link href={`/admin/categories/${category.id}`}>
                  <Pencil className="size-4" />
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
