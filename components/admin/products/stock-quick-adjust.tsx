"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { adjustVariantStock } from "@/lib/actions/admin/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { t } from "@/lib/i18n";

interface StockQuickAdjustProps {
  productId: string;
  variantId: string;
  stock: number;
}

// Single-number stock fix from the products table row, without opening the full product form.
// Only rendered by ProductsTable for single-variant products — a multi-variant product's row
// shows a combined total, and there's no single variant a table-row edit could unambiguously target.
export function StockQuickAdjust({ productId, variantId, stock }: StockQuickAdjustProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(stock));
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSave() {
    const nextStock = Number(value);
    if (!Number.isInteger(nextStock) || nextStock < 0) {
      toast.error(t("admin.products.invalidStock"));
      return;
    }

    setIsSubmitting(true);
    const result = await adjustVariantStock(productId, variantId, nextStock);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(t("admin.products.stockUpdated"));
    setOpen(false);
    router.refresh();
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setValue(String(stock));
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={t("admin.products.adjustStock")}>
          <Pencil className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <div className="flex flex-col gap-2">
          <Input
            type="number"
            min="0"
            step="1"
            autoFocus
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <Button size="sm" disabled={isSubmitting} onClick={handleSave}>
            {t("common.save")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
