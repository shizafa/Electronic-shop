"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createSpecField,
  deleteSpecField,
  updateSpecField,
  type SpecFieldFormInput,
} from "@/lib/actions/admin/categories";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { t } from "@/lib/i18n";
import type { SpecFieldDefinition, SpecFieldType } from "@/types/category";

interface SpecFieldsPanelProps {
  categoryId: string;
  specFields: SpecFieldDefinition[];
  onSpecFieldsChange: (specFields: SpecFieldDefinition[]) => void;
}

type DialogState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; field: SpecFieldDefinition };
type DeleteState = { open: false } | { open: true; field: SpecFieldDefinition };

const TYPE_LABEL_KEYS: Record<SpecFieldType, string> = {
  text: "admin.categories.specFieldTypeText",
  number: "admin.categories.specFieldTypeNumber",
  boolean: "admin.categories.specFieldTypeBoolean",
  enum: "admin.categories.specFieldTypeEnum",
};

// Manages the spec_fields that define this category's filterable/comparable attributes
// (e.g. "RAM", "BTU") — same table + dialog shape as VariantsPanel, since spec_fields is
// structurally the same kind of thing: a separate table keyed off the parent id.
export function SpecFieldsPanel({ categoryId, specFields, onSpecFieldsChange }: SpecFieldsPanelProps) {
  const [dialogState, setDialogState] = useState<DialogState>({ mode: "closed" });
  const [deleteState, setDeleteState] = useState<DeleteState>({ open: false });

  function openCreate() {
    setDialogState({ mode: "create" });
  }

  function openEdit(field: SpecFieldDefinition) {
    setDialogState({ mode: "edit", field });
  }

  async function handleSave(input: SpecFieldFormInput) {
    if (dialogState.mode === "create") {
      const result = await createSpecField(categoryId, input);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      onSpecFieldsChange([
        ...specFields,
        {
          id: result.id,
          labelKey: input.label,
          unit: input.unit,
          type: input.type,
          options: input.options,
          filterable: input.filterable,
          showInCompare: input.showInCompare,
        },
      ]);
    } else if (dialogState.mode === "edit") {
      const result = await updateSpecField(categoryId, dialogState.field.id, input);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      onSpecFieldsChange(
        specFields.map((field) =>
          field.id === dialogState.field.id
            ? {
                ...field,
                labelKey: input.label,
                unit: input.unit,
                type: input.type,
                options: input.options,
                filterable: input.filterable,
                showInCompare: input.showInCompare,
              }
            : field
        )
      );
    }
    toast.success(t("admin.categories.categorySaved"));
    setDialogState({ mode: "closed" });
  }

  async function handleDelete() {
    if (!deleteState.open) return;
    const result = await deleteSpecField(categoryId, deleteState.field.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    onSpecFieldsChange(specFields.filter((field) => field.id !== deleteState.field.id));
    setDeleteState({ open: false });
  }

  async function move(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= specFields.length) return;

    const reordered = specFields.slice();
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    onSpecFieldsChange(reordered);

    await Promise.all(
      reordered.map((field, sortOrder) =>
        updateSpecField(categoryId, field.id, {
          label: field.labelKey,
          unit: field.unit,
          type: field.type,
          options: field.options,
          filterable: field.filterable,
          showInCompare: field.showInCompare,
          sortOrder,
        })
      )
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {specFields.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("admin.categories.noSpecFields")}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.categories.specFieldLabel")}</TableHead>
              <TableHead>{t("admin.categories.specFieldType")}</TableHead>
              <TableHead>{t("admin.categories.specFieldFilterable")}</TableHead>
              <TableHead>{t("admin.categories.specFieldShowInCompare")}</TableHead>
              <TableHead className="text-end">{t("admin.products.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {specFields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell className="font-medium">
                  {t(field.labelKey)}
                  {field.unit ? ` (${field.unit})` : ""}
                </TableCell>
                <TableCell className="text-muted-foreground">{t(TYPE_LABEL_KEYS[field.type])}</TableCell>
                <TableCell>{field.filterable ? t("common.yes") : t("common.no")}</TableCell>
                <TableCell>{field.showInCompare ? t("common.yes") : t("common.no")}</TableCell>
                <TableCell className="text-end">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label="Move up"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === specFields.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label="Move down"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(field)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setDeleteState({ open: true, field })}>
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
        {t("admin.categories.addSpecField")}
      </Button>

      <Dialog
        open={dialogState.mode !== "closed"}
        onOpenChange={(open) => !open && setDialogState({ mode: "closed" })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogState.mode === "edit" ? t("admin.categories.editSpecField") : t("admin.categories.addSpecField")}
            </DialogTitle>
          </DialogHeader>
          {dialogState.mode !== "closed" && (
            <SpecFieldDialogForm
              initialField={dialogState.mode === "edit" ? dialogState.field : undefined}
              nextSortOrder={specFields.length}
              onSave={handleSave}
              onCancel={() => setDialogState({ mode: "closed" })}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteState.open} onOpenChange={(open) => !open && setDeleteState({ open: false })}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("admin.categories.deleteSpecField")}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteState({ open: false })}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t("admin.categories.deleteSpecField")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface SpecFieldDialogFormProps {
  initialField?: SpecFieldDefinition;
  nextSortOrder: number;
  onSave: (input: SpecFieldFormInput) => Promise<void>;
  onCancel: () => void;
}

function SpecFieldDialogForm({ initialField, nextSortOrder, onSave, onCancel }: SpecFieldDialogFormProps) {
  // t() resolves legacy i18n-key labels (from the original seed data) to readable text; plain
  // text typed by an admin just passes through unchanged. Saving always writes plain text back,
  // so editing an old key-based field migrates it to plain text.
  const [label, setLabel] = useState(t(initialField?.labelKey ?? ""));
  const [unit, setUnit] = useState(initialField?.unit ?? "");
  const [type, setType] = useState<SpecFieldType>(initialField?.type ?? "text");
  const [options, setOptions] = useState((initialField?.options ?? []).join(", "));
  const [filterable, setFilterable] = useState(initialField?.filterable ?? true);
  const [showInCompare, setShowInCompare] = useState(initialField?.showInCompare ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    await onSave({
      label,
      unit: unit || undefined,
      type,
      options: type === "enum" ? options.split(",").map((option) => option.trim()).filter(Boolean) : undefined,
      filterable,
      showInCompare,
      sortOrder: nextSortOrder,
    });
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="spec-field-label">{t("admin.categories.specFieldLabel")}</Label>
        <Input id="spec-field-label" required value={label} onChange={(event) => setLabel(event.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label>{t("admin.categories.specFieldType")}</Label>
          <Select value={type} onValueChange={(value) => setType(value as SpecFieldType)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(TYPE_LABEL_KEYS) as SpecFieldType[]).map((option) => (
                <SelectItem key={option} value={option}>
                  {t(TYPE_LABEL_KEYS[option])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="spec-field-unit">{t("admin.categories.specFieldUnit")}</Label>
          <Input id="spec-field-unit" value={unit} onChange={(event) => setUnit(event.target.value)} />
        </div>
      </div>

      {type === "enum" && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="spec-field-options">{t("admin.categories.specFieldOptions")}</Label>
          <Input
            id="spec-field-options"
            required
            value={options}
            onChange={(event) => setOptions(event.target.value)}
            placeholder="e.g. 3 Star, 4 Star, 5 Star"
          />
        </div>
      )}

      <label className="flex items-center gap-2 text-sm font-medium">
        <Checkbox checked={filterable} onCheckedChange={(checked) => setFilterable(checked === true)} />
        {t("admin.categories.specFieldFilterable")}
      </label>

      <label className="flex items-center gap-2 text-sm font-medium">
        <Checkbox checked={showInCompare} onCheckedChange={(checked) => setShowInCompare(checked === true)} />
        {t("admin.categories.specFieldShowInCompare")}
      </label>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {t("admin.categories.saveSpecField")}
        </Button>
      </DialogFooter>
    </form>
  );
}
