"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createProduct, deleteProduct, updateProduct } from "@/lib/actions/admin/products";
import { ProductImageUploader } from "@/components/admin/products/product-image-uploader";
import { ProductSpecsFields } from "@/components/admin/products/product-specs-fields";
import { VariantAxesEditor } from "@/components/admin/products/variant-axes-editor";
import { VariantsPanel } from "@/components/admin/products/variants-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/lib/i18n";
import type { Category } from "@/types/category";
import type { Product, Variant, VariantAxisDefinition } from "@/types/product";

interface ProductFormProps {
  categories: Category[];
  product?: Product;
}

// Product create/edit form. New products only get the details/specs/variant-axes tabs —
// variants need a real productId to attach to, so that tab shows a "save first" hint until
// the product exists (see admin.products.variantsSaveFirst).
export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? categories[0]?.id ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [specs, setSpecs] = useState<Record<string, string | number | boolean>>(product?.specs ?? {});
  const [variantAxes, setVariantAxes] = useState<VariantAxisDefinition[]>(product?.variantAxes ?? []);
  const [variants, setVariants] = useState<Variant[]>(product?.variants ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const selectedCategory = categories.find((category) => category.id === categoryId);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const input = { name, brand, categoryId, description, images, specs, variantAxes, featured };
    const result = isEditing ? await updateProduct(product!.id, input) : await createProduct(input);

    setIsSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(t("admin.products.productSaved"));
    if (isEditing) router.refresh();
    else router.push(`/admin/products/${result.id}`);
  }

  async function handleDelete() {
    if (!product) return;
    const result = await deleteProduct(product.id);
    if (!result.success) {
      toast.error(result.error);
      setDeleteOpen(false);
      return;
    }
    router.push("/admin/products");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-foreground">
          {isEditing ? product!.name : t("admin.products.newProduct")}
        </h2>
        {isEditing && (
          <Button type="button" variant="destructive" onClick={() => setDeleteOpen(true)}>
            {t("admin.products.deleteProduct")}
          </Button>
        )}
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">{t("admin.products.details")}</TabsTrigger>
          <TabsTrigger value="specs">{t("admin.products.specs")}</TabsTrigger>
          <TabsTrigger value="variants">{t("admin.products.variants")}</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="product-name">{t("admin.products.name")}</Label>
                  <Input id="product-name" required value={name} onChange={(event) => setName(event.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="product-brand">{t("admin.products.brand")}</Label>
                  <Input
                    id="product-brand"
                    required
                    value={brand}
                    onChange={(event) => setBrand(event.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 sm:max-w-xs">
                <Label>{t("admin.products.category")}</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="product-description">{t("admin.products.description")}</Label>
                <Textarea
                  id="product-description"
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>{t("admin.products.images")}</Label>
                <ProductImageUploader images={images} onChange={setImages} />
              </div>

              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox checked={featured} onCheckedChange={(checked) => setFeatured(checked === true)} />
                {t("admin.products.featured")}
              </label>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specs">
          <Card>
            <CardContent className="pt-6">
              <ProductSpecsFields specFields={selectedCategory?.specFields ?? []} specs={specs} onChange={setSpecs} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <VariantAxesEditor axes={variantAxes} onChange={setVariantAxes} />
              {isEditing ? (
                <VariantsPanel
                  productId={product!.id}
                  variantAxes={variantAxes}
                  variants={variants}
                  onVariantsChange={setVariants}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{t("admin.products.variantsSaveFirst")}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isEditing ? t("admin.products.saveProduct") : t("admin.products.createProduct")}
        </Button>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("admin.products.deleteProductConfirm")}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t("admin.products.deleteProduct")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}