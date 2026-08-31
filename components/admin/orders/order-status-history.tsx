import { t } from "@/lib/i18n";
import type { OrderStatusHistoryEntry } from "@/types/order";

interface OrderStatusHistoryProps {
  history: OrderStatusHistoryEntry[];
}

// Chronological audit-trail list of every status change on an order — distinct from
// StatusTimeline, which only shows current progress along the main line, not a dated log with notes.
export function OrderStatusHistory({ history }: OrderStatusHistoryProps) {
  if (history.length === 0) return null;

  return (
    <div>
      <p className="text-sm font-semibold text-foreground">{t("admin.orders.statusHistory")}</p>
      <ol className="mt-2 flex flex-col gap-3 border-s border-border ps-4">
        {history.map((entry, index) => (
          <li key={`${entry.status}-${entry.changedAt}-${index}`} className="text-sm">
            <p className="font-medium text-foreground">{t(`orderStatus.${entry.status}`)}</p>
            <p className="text-xs text-muted-foreground">{entry.changedAt}</p>
            {entry.note && <p className="mt-0.5 text-muted-foreground">{entry.note}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}
