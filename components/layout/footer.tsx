import Link from "next/link";
import { getAllCategories } from "@/lib/categories";
import { t } from "@/lib/i18n";

const categories = getAllCategories();

const companyLinks = [
  { href: "/about", labelKey: "footer.aboutUs" },
  { href: "/contact", labelKey: "footer.contactUs" },
];

const supportLinks = [
  { href: "/faqs", labelKey: "footer.faqs" },
  { href: "/policies/shipping-installation", labelKey: "footer.shippingInstallation" },
  { href: "/policies/returns-warranty", labelKey: "footer.returnsWarranty" },
];

const legalLinks = [
  { href: "/policies/privacy", labelKey: "footer.privacyPolicy" },
  { href: "/policies/terms", labelKey: "footer.termsOfService" },
];

function FooterColumn({
  headingKey,
  links,
}: {
  headingKey: string;
  links: { href: string; labelKey: string }[];
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">{t(headingKey)}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
              {t(link.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const categoryLinks = categories.map((category) => ({
    href: `/category/${category.slug}`,
    labelKey: category.nameKey,
  }));

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="text-lg font-semibold text-foreground">{t("site.name")}</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{t("footer.tagline")}</p>
        </div>

        <FooterColumn headingKey="nav.categories" links={categoryLinks} />
        <FooterColumn headingKey="footer.support" links={[...companyLinks, ...supportLinks]} />
        <FooterColumn headingKey="footer.legal" links={legalLinks} />
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:px-6">
          <p>
            &copy; {new Date().getFullYear()} {t("site.name")}. {t("footer.copyright")}
          </p>
          <p>
            {t("checkout.codAvailable")} · {t("checkout.installationService")} ·{" "}
            {t("checkout.secureCheckout")}
          </p>
        </div>
      </div>
    </footer>
  );
}