import type { Metadata } from "next";
import { Award, MapPin, ShieldCheck, Users } from "lucide-react";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("footer.aboutUs"),
};

const values = [
  {
    icon: MapPin,
    title: "Nationwide Reach",
    description: "We deliver and install across major cities in Pakistan, from Karachi to Islamabad.",
  },
  {
    icon: ShieldCheck,
    title: "Genuine Products",
    description: "Every product we sell is sourced directly from authorized brands and distributors.",
  },
  {
    icon: Award,
    title: "Certified Installation",
    description:
      "Our installation technicians are trained and certified for air conditioners and major appliances.",
  },
  {
    icon: Users,
    title: "Customer-First Support",
    description: "From order placement to after-sales service, our support team is here to help.",
  },
];

// /about route: static company story and "why choose us" content
export default function AboutPage() {
  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("footer.aboutUs")}</h1>
      <p className="mt-4 text-base text-muted-foreground">
        {t("site.name")} is a Pakistan-based electronics and home appliances retailer, bringing air
        conditioners, televisions, and mobile phones from trusted brands directly to your door — with
        transparent pricing, reliable delivery, and professional installation where it matters most.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-foreground">{t("about.ourStory")}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        We started with a simple idea: buying a large appliance shouldn&apos;t be complicated. No
        confusing showroom visits, no guessing whether Cash on Delivery is really an option, no
        surprise installation costs. Today, we serve customers across Pakistan with a catalog built
        around the appliances people actually rely on every day — cooling, entertainment, and
        connectivity.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-foreground">{t("about.whyChooseUs")}</h2>
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {values.map((value) => (
          <div key={value.title} className="flex gap-3">
            <value.icon className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">{value.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{value.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}