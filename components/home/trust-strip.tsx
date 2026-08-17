import { HandCoins, ShieldCheck, Truck, Wrench } from "lucide-react";
import { t } from "@/lib/i18n";

const items = [
  { icon: Truck, labelKey: "home.trust.freeDelivery" },
  { icon: Wrench, labelKey: "checkout.installationService" },
  { icon: HandCoins, labelKey: "checkout.codAvailable" },
  { icon: ShieldCheck, labelKey: "checkout.secureCheckout" },
];

export function TrustStrip() {
  return (
    <section className="border-y border-border bg-muted/40">
      <div className="container-page grid grid-cols-2 gap-4 py-6 sm:grid-cols-4 sm:gap-6">
        {items.map(({ icon: Icon, labelKey }) => (
          <div key={labelKey} className="flex items-center gap-2.5">
            <Icon className="size-5 shrink-0 text-primary" />
            <span className="text-sm font-medium text-foreground">{t(labelKey)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}