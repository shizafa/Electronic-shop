"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createVariant, deleteVariant, updateVariant, type VariantFormInput } from "@/lib/actions/admin/products";
import { ProductImageUploader } from "@/components/admin/products/product-image-uploader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import type { VariantAxisDefinition, Variant } from "@/types/product";

interface VariantsPanelProps {
  productId: string;
  variantAxes: VariantAxisDefinition[];
  variants: Variant[];
  onVariantsChange: (variants: Variant[]) => void;
}

type DialogState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; variant: Variant };
type DeleteState = { open: false } | { open: true; variant: Variant };

function emptyAxisValues(axes: VariantAxisDefinition[]): Record<string, string> {
  return Object.fromEntries(axes.map((axis) => [axis.id, ""]));
}

export function VariantsPanel({ productId, variantAxes, variants, onVariantsChange }: VariantsPanelProps) {
  const [dialogState, setDialogState] = useState<DialogState>({ mode: "closed" });
  const [deleteState, setDeleteState] = useState<DeleteState>({ open: false });

  function openCreate() {
    setDialogState({ mode: "create" });
  }

  function openEdit(variant: Variant) {
    setDialogState({ mode: "edit", variant });
  }

  async function handleSave(input: VariantFormInput) {
    if (dialogState.mode === "create") {
      const result = await createVariant(productId, input);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      onVariantsChange([...variants, { id: result.id, productId, ...input }]);
    } else if (dialogState.mode === "edit") {
      const result = await updateVariant(dialogState.variant.id, input);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      onVariantsChange(
        variants.map((variant) =>
          variant.id === dialogState.variant.id ? { ...variant, ...input } : variant
        )
      );
    }
    toast.success(t("admin.products.productSaved"));
    setDialogState({ mode: "closed" });
  }

  async function handleDelete() {
    if (!deleteState.open) return;
    const result = await deleteVariant(deleteState.variant.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    onVariantsChange(variants.filter((variant) => variant.id !== deleteState.variant.id));
    setDeleteState({ open: false });
  }

  return (
    <div className="flex flex-col gap-3">
      {variants.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("admin.products.noVariants")}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.products.sku")}</TableHead>
              {variantAxes.map((axis) => (
                <TableHead key={axis.id}>{axis.labelKey || axis.id}</TableHead>
              ))}
              <TableHead>{t("admin.products.price")}</TableHead>
              <TableHead>{t("admin.products.stock")}</TableHead>
              <TableHead className="text-end">{t("admin.products.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell className="font-medium">{variant.sku}</TableCell>
                {variantAxes.map((axis) => (
                  <TableCell key={axis.id} className="text-muted-foreground">
                    {variant.axisValues[axis.id] ?? "—"}
                    {axis.unit ? ` ${axis.unit}` : ""}
                  </TableCell>
                ))}
                <TableCell>{formatPrice(variant.price)}</TableCell>
                <TableCell>{variant.stock}</TableCell>
                <TableCell className="text-end">
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(variant)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setDeleteState({ open: true, variant })}>
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Button type="button" variant="outline" size="sm" onClick={openCreate} className="self-start">
        <Plus className="size-4" />
        {t("admin.products.addVariant")}
      </Button>

      <Dialog
        open={dialogState.mode !== "closed"}
        onOpenChange={(open) => !open && setDialogState({ mode: "closed" })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogState.mode === "edit" ? t("admin.products.editVariant") : t("admin.products.addVariant")}
            </DialogTitle>
          </DialogHeader>
          {dialogState.mode !== "closed" && (
            <VariantDialogForm
              axes={variantAxes}
              initialVariant={dialogState.mode === "edit" ? dialogState.variant : undefined}
              onSave={handleSave}
              onCancel={() => setDialogState({ mode: "closed" })}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteState.open} onOpenChange={(open) => !open && setDeleteState({ open: false })}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("admin.products.deleteVariant")}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteState({ open: false })}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t("account.deleteAddress")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface VariantDialogFormProps {
  axes: VariantAxisDefinition[];
  initialVariant?: Variant;
  onSave: (input: VariantFormInput) => Promise<void>;
  onCancel: () => void;
}

function VariantDialogForm({ axes, initialVariant, onSave, onCancel }: VariantDialogFormProps) {
  const [sku, setSku] = useState(initialVariant?.sku ?? "");
  const [axisValues, setAxisValues] = useState<Record<string, string>>(
    initialVariant?.axisValues ?? emptyAxisValues(axes)
  );
  const [price, setPrice] = useState(String(initialVariant?.price ?? ""));
  const [compareAtPrice, setCompareAtPrice] = useState(
    initialVariant?.compareAtPrice !== undefined ? String(initialVariant.compareAtPrice) : ""
  );
  const [stock, setStock] = useState(String(initialVariant?.stock ?? "0"));
  const [images, setImages] = useState<string[]>(initialVariant?.images ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    await onSave({
      sku,
      axisValues,
      price: Number(price) || 0,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      stock: Number(stock) || 0,
      images,
    });
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="variant-sku">{t("admin.products.sku")}</Label>
        <Input id="variant-sku" required value={sku} onChange={(event) => setSku(event.target.value)} />
      </div>

      {axes.map((axis) => (
        <div key={axis.id} className="flex flex-col gap-1.5">
          <Label htmlFor={`variant-axis-${axis.id}`}>
            {axis.labelKey || axis.id}
            {axis.unit ? ` (${axis.unit})` : ""}
          </Label>
          <Input
            id={`variant-axis-${axis.id}`}
            value={axisValues[axis.id] ?? ""}
            onChange={(event) => setAxisValues((current) => ({ ...current, [axis.id]: event.target.value }))}
          />
        </div>
      ))}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="variant-price">{t("admin.products.price")}</Label>
          <Input
            id="variant-price"
            type="number"
            min="0"
            step="0.01"
            required
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="variant-compare-price">{t("admin.products.compareAtPrice")}</Label>
          <Input
            id="variant-compare-price"
            type="number"
            min="0"
            step="0.01"
            value={compareAtPrice}
            onChange={(event) => setCompareAtPrice(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="variant-stock">{t("admin.products.stock")}</Label>
        <Input
          id="variant-stock"
          type="number"
          min="0"
          step="1"
          required
          value={stock}
          onChange={(event) => setStock(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t("admin.products.images")}</Label>
        <ProductImageUploader images={images} onChange={setImages} />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {t("admin.products.saveVariant")}
        </Button>
      </DialogFooter>
    </form>
  );
}
