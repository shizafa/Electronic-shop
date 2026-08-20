"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "@/lib/i18n";
import type { VariantAxisDefinition } from "@/types/product";

interface VariantAxesEditorProps {
  axes: VariantAxisDefinition[];
  onChange: (axes: VariantAxisDefinition[]) => void;
}

// Defines the ways variants of this product differ (e.g. "Storage", "Color") — each variant
// then picks one value per axis. labelKey is stored as the literal display text the admin
// types (lib/i18n's t() falls back to returning an unknown key verbatim), same convention
// used for category spec field labels.
export function VariantAxesEditor({ axes, onChange }: VariantAxesEditorProps) {
  function addAxis() {
    onChange([...axes, { id: crypto.randomUUID(), labelKey: "", unit: "" }]);
  }

  function updateAxis(id: string, updates: Partial<VariantAxisDefinition>) {
    onChange(axes.map((axis) => (axis.id === id ? { ...axis, ...updates } : axis)));
  }

  function removeAxis(id: string) {
    onChange(axes.filter((axis) => axis.id !== id));
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>{t("admin.products.variantAxes")}</Label>
      {axes.map((axis) => (
        <div key={axis.id} className="flex items-center gap-2">
          <Input
            value={axis.labelKey}
            onChange={(event) => updateAxis(axis.id, { labelKey: event.target.value })}
            placeholder={t("admin.products.axisLabel")}
            className="flex-1"
          />
          <Input
            value={axis.unit ?? ""}
            onChange={(event) => updateAxis(axis.id, { unit: event.target.value })}
            placeholder={t("admin.products.axisUnit")}
            className="w-24"
          />
          <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeAxis(axis.id)}>
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addAxis} className="self-start">
        <Plus className="size-4" />
        {t("admin.products.addAxis")}
      </Button>
    </div>
  );
}
