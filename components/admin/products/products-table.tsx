import Image from "next/image";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/currency";
import { t } from "@/lib/i18n";
import type { Product } from "@/types/product";

interface ProductsTableProps {
  products: Product[];
  categoryNameById: Record<string, string>;
}

// Formats a product's variant prices as a single value or a "from X" range
function formatPriceRange(product: Product): string {
  if (product.variants.length === 0) return "—";
  const prices = product.variants.map((variant) => variant.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`;
}

function totalStock(product: Product): number {
  return product.variants.reduce((sum, variant) => sum + variant.stock, 0);
}

export function ProductsTable({ products, categoryNameById }: ProductsTableProps) {
  if (products.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{t("admin.products.noProducts")}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("admin.products.product")}</TableHead>
          <TableHead>{t("admin.products.category")}</TableHead>
          <TableHead>{t("admin.products.price")}</TableHead>
          <TableHead>{t("admin.products.stock")}</TableHead>
          <TableHead className="text-end">{t("admin.products.actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          const stock = totalStock(product);
          return (
            <TableRow key={product.id}>
              <TableCell>
                <Link href={`/admin/products/${product.id}`} className="flex items-center gap-3 hover:underline">
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                    {product.images[0] && (
                      <Image src={product.images[0]} alt={product.name} fill sizes="40px" className="object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                  </div>
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {categoryNameById[product.categoryId] ?? product.categoryId}
              </TableCell>
              <TableCell>{formatPriceRange(product)}</TableCell>
              <TableCell>
                {stock > 0 ? stock : <Badge variant="destructive">{t("common.outOfStock")}</Badge>}
              </TableCell>
              <TableCell className="text-end">
                <Button variant="ghost" size="icon-sm" asChild aria-label={t("admin.products.edit")}>
                  <Link href={`/admin/products/${product.id}`}>
                    <Pencil className="size-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
