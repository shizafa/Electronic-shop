"use client";

import { t } from "@/lib/i18n";
import type { Product, Variant } from "@/types/product";

interface VariantSelectorProps {
  product: Product;
  selectedVariant: Variant;
  onSelectVariant: (variant: Variant) => void;
}

// Lets the shopper pick variant options (e.g. storage, colour, tonnage) on the product page.
export function VariantSelector({ product, selectedVariant, onSelectVariant }: VariantSelectorProps) {
  // Looks for a variant matching every axis value at once (e.g. this storage AND this colour).
  function findExactMatch(candidateSelections: Record<string, string>): Variant | undefined {
    return product.variants.find((variant) =>
      product.variantAxes.every((axis) => variant.axisValues[axis.id] === candidateSelections[axis.id])
    );
  }

  function handleSelect(axisId: string, value: string) {
    const nextSelections = { ...selectedVariant.axisValues, [axisId]: value };

    // The previously selected value on another axis might not exist in
    // combination with this new value (e.g. this colour isn't offered in
    // that storage tier) — fall back to any variant that has this value.
    const matchedVariant =
      findExactMatch(nextSelections) ??
      product.variants.find((variant) => variant.axisValues[axisId] === value);

    if (matchedVariant) {
      onSelectVariant(matchedVariant);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {product.variantAxes.map((axis) => {
        // unique set of values offered for this axis (e.g. all distinct colours across variants)
        const values = Array.from(
          new Set(product.variants.map((variant) => variant.axisValues[axis.id]))
        );

        return (
          <div key={axis.id}>
            <p className="mb-2 text-sm font-medium text-foreground">
              {t(axis.labelKey)}
              {axis.unit ? ` (${axis.unit})` : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                const isSelected = selectedVariant.axisValues[axis.id] === value;
                // disable the option if no in-stock variant offers this value at all
                const isAvailable = product.variants.some(
                  (variant) => variant.axisValues[axis.id] === value && variant.stock > 0
                );

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleSelect(axis.id, value)}
                    disabled={!isAvailable}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}