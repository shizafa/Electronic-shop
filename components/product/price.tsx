import { formatPrice } from "@/lib/currency";

interface PriceProps {
  price: number;
  compareAtPrice?: number;
  className?: string;
}

// Formats and displays a price, with an optional struck-through original price if discounted.
export function Price({ price, compareAtPrice, className }: PriceProps) {
  const hasDiscount = compareAtPrice !== undefined && compareAtPrice > price;

  return (
    <span className={`inline-flex items-baseline gap-2 ${className ?? ""}`}>
      <span className="font-semibold text-foreground">{formatPrice(price)}</span>
      {hasDiscount && (
        <span className="text-sm text-muted-foreground line-through">
          {formatPrice(compareAtPrice)}
        </span>
      )}
    </span>
  );
}