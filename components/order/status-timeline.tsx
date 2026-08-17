import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { getOrderTimeline } from "@/lib/orders";
import { t } from "@/lib/i18n";
import type { Order } from "@/types/order";

// StatusTimeline — visual progress tracker (placed -> ... -> delivered, or cancelled) for an order
export function StatusTimeline({ order }: { order: Order }) {
  const steps = getOrderTimeline(order);

  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6">
      {steps.map((step) => {
        // cancelled orders get their own icon/color instead of the normal completed/pending states
        const isCancelledStep = step.status === "cancelled";

        return (
          <li key={step.status} className="flex items-center gap-2 sm:flex-col sm:items-start sm:gap-1">
            {isCancelledStep ? (
              <XCircle className="size-5 text-destructive" />
            ) : step.completed ? (
              <CheckCircle2 className={`size-5 ${step.current ? "text-primary" : "text-emerald-600"}`} />
            ) : (
              <Circle className="size-5 text-muted-foreground" />
            )}
            <span
              className={`text-sm font-medium ${
                isCancelledStep
                  ? "text-destructive"
                  : step.completed
                    ? "text-foreground"
                    : "text-muted-foreground"
              }`}
            >
              {t(step.labelKey)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}