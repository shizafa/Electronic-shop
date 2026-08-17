import Link from "next/link";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

// Static countdown values — display only, does not actually tick down
const countdown = [
  { value: "02", labelKey: "home.promo.days" },
  { value: "15", labelKey: "home.promo.hours" },
  { value: "45", labelKey: "home.promo.minutes" },
  { value: "30", labelKey: "home.promo.seconds" },
];

// Homepage promo banner with a (hardcoded, non-live) sale countdown
export function PromoBanner() {
  return (
    <section className="container-page py-8">
      <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-primary px-6 py-8 text-primary-foreground sm:flex-row sm:items-center sm:px-10">
        <div>
          <h2 className="text-xl font-semibold sm:text-2xl">{t("home.promo.heading")}</h2>
          <p className="mt-1 text-sm text-primary-foreground/80">{t("home.promo.subheading")}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {countdown.map((unit) => (
              <div
                key={unit.labelKey}
                className="flex w-12 flex-col items-center rounded-lg bg-primary-foreground/15 py-1.5"
              >
                <span className="text-lg font-semibold tabular-nums">{unit.value}</span>
                <span className="text-[10px] text-primary-foreground/70 uppercase">
                  {t(unit.labelKey)}
                </span>
              </div>
            ))}
          </div>

          <Button size="lg" variant="secondary" asChild>
            <Link href="/category/televisions">{t("home.promo.cta")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}