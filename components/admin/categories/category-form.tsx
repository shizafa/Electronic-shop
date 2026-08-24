"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCategory, deleteCategory, updateCategory } from "@/lib/actions/admin/categories";
import { CategoryImageUploader } from "@/components/admin/categories/category-image-uploader";
import { SpecFieldsPanel } from "@/components/admin/categories/spec-fields-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/lib/i18n";
import type { Category, SpecFieldDefinition } from "@/types/category";

interface CategoryFormProps {
  category?: Category;
}

// Category create/edit form. New categories only get the Details tab — spec fields need a
// real categoryId to attach to, so that tab shows a "save first" hint until the category
// exists (same pattern as ProductForm's variants tab).
export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const isEditing = Boolean(category);

  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(category?.thumbnailUrl ?? null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(category?.bannerUrl ?? null);
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [displayOrder, setDisplayOrder] = useState(String(category?.displayOrder ?? 0));
  const [installationRequired, setInstallationRequired] = useState(category?.installationRequired ?? false);
  const [specFields, setSpecFields] = useState<SpecFieldDefinition[]>(category?.specFields ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const input = {
      name,
      description,
      thumbnailUrl,
      bannerUrl,
      isActive,
      displayOrder: Number(displayOrder) || 0,
      installationRequired,
    };
    const result = isEditing ? await updateCategory(category!.id, input) : await createCategory(input);

    setIsSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(t("admin.categories.categorySaved"));
    if (isEditing) router.refresh();
    else router.push(`/admin/categories/${result.id}`);
  }

  async function handleDelete() {
    if (!category) return;
    const result = await deleteCategory(category.id);
    if (!result.success) {
      toast.error(result.error);
      setDeleteOpen(false);
      return;
    }
    router.push("/admin/categories");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-foreground">
          {isEditing ? category!.name : t("admin.categories.newCategory")}
        </h2>
        {isEditing && (
          <Button type="button" variant="destructive" onClick={() => setDeleteOpen(true)}>
            {t("admin.categories.deleteCategory")}
          </Button>
        )}
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">{t("admin.categories.details")}</TabsTrigger>
          <TabsTrigger value="specFields">{t("admin.categories.specFields")}</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="category-name">{t("admin.categories.name")}</Label>
                  <Input
                    id="category-name"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="category-display-order">{t("admin.categories.displayOrder")}</Label>
                  <Input
                    id="category-display-order"
                    type="number"
                    step="1"
                    value={displayOrder}
                    onChange={(event) => setDisplayOrder(event.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="category-description">{t("admin.categories.description")}</Label>
                <Textarea
                  id="category-description"
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label>{t("admin.categories.thumbnail")}</Label>
                  <CategoryImageUploader image={thumbnailUrl} onChange={setThumbnailUrl} aspect="square" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>{t("admin.categories.banner")}</Label>
                  <CategoryImageUploader image={bannerUrl} onChange={setBannerUrl} aspect="wide" />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox
                  checked={installationRequired}
                  onCheckedChange={(checked) => setInstallationRequired(checked === true)}
                />
                {t("admin.categories.installationRequired")}
              </label>

              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox checked={isActive} onCheckedChange={(checked) => setIsActive(checked === true)} />
                {t("admin.categories.isActive")}
              </label>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specFields">
          <Card>
            <CardContent className="pt-6">
              {isEditing ? (
                <SpecFieldsPanel categoryId={category!.id} specFields={specFields} onSpecFieldsChange={setSpecFields} />
              ) : (
                <p className="text-sm text-muted-foreground">{t("admin.categories.specFieldsSaveFirst")}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isEditing ? t("admin.categories.saveCategory") : t("admin.categories.createCategory")}
        </Button>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("admin.categories.deleteCategoryConfirm")}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t("admin.categories.deleteCategory")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
