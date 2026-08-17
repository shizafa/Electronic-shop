import { Award, LifeBuoy, RotateCcw, Truck } from "lucide-react";
import { t } from "@/lib/i18n";

const items = [
  { icon: Award, labelKey: "home.guarantee.qualityAssured" },
  { icon: Truck, labelKey: "home.guarantee.fastDelivery" },
  { icon: RotateCcw, labelKey: "home.guarantee.easyReturns" },
  { icon: LifeBuoy, labelKey: "home.guarantee.support" },
];

export function GuaranteeStrip() {
  return (
    <section className="border-t border-border">
      <div className="container-page grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
        {items.map(({ icon: Icon, labelKey }) => (
          <div key={labelKey} className="flex flex-col items-center gap-2 text-center">
            <Icon className="size-6 text-primary" />
            <span className="text-sm font-medium text-foreground">{t(labelKey)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}