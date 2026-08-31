import { Badge } from "@/components/ui/badge";
import { t } from "@/lib/i18n";
import type { StockStatus } from "@/lib/product-helpers";

const DOT_CLASS_BY_STATUS: Record<StockStatus, string> = {
  in: "bg-status-good",
  low: "bg-status-warning",
  out: "bg-status-critical",
};

const LABEL_KEY_BY_STATUS: Record<StockStatus, string> = {
  in: "admin.products.stockStatus.inStock",
  low: "admin.products.stockStatus.lowStock",
  out: "admin.products.stockStatus.outOfStock",
};

export function StockStatusBadge({ status }: { status: StockStatus }) {
  return (
    <Badge variant="outline" className="gap-1.5">
      <span className={`size-1.5 shrink-0 rounded-full ${DOT_CLASS_BY_STATUS[status]}`} />
      {t(LABEL_KEY_BY_STATUS[status])}
    </Badge>
  );
}
