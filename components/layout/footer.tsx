import Link from "next/link";
import { NewsletterBar } from "@/components/layout/newsletter-bar";
import { getAllCategories } from "@/lib/categories";
import { t } from "@/lib/i18n";

const helpLinks = [
  { href: "/account/profile", labelKey: "footer.accountInfo" },
  { href: "/account/orders", labelKey: "footer.yourOrders" },
  { href: "/policies/returns-warranty", labelKey: "footer.returnsWarranty" },
  { href: "/policies/shipping-installation", labelKey: "footer.shippingInstallation" },
  { href: "/policies/privacy", labelKey: "footer.privacyPolicy" },
  { href: "/policies/terms", labelKey: "footer.termsOfService" },
  { href: "/faqs", labelKey: "footer.faqs" },
];

const aboutLinks = [
  { href: "/about", labelKey: "footer.aboutUs" },
  { href: "/contact", labelKey: "footer.contactUs" },
];

// FooterColumn — renders one labeled column of links in the footer
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

// Footer — site-wide footer with category/help/about links and trust badges
export async function Footer() {
  const categories = await getAllCategories();
  const categoryLinks = categories.map((category) => ({
    href: `/category/${category.slug}`,
    labelKey: category.nameKey,
  }));

  return (
    <footer className="border-t border-border">
      <NewsletterBar />

      <div className="bg-muted/40">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          <div className="border-border sm:col-span-2 sm:border-r sm:pr-8 lg:col-span-1">
            <p className="text-lg font-semibold text-foreground">{t("site.name")}</p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">{t("footer.tagline")}</p>

            <div className="mt-4 flex flex-col gap-1">
              <p className="text-sm font-semibold text-foreground">{t("contact.phone")}</p>
              <a href="tel:+021111000000" className="text-sm text-muted-foreground hover:text-foreground">
                021-111-000-000
              </a>
            </div>

            <div className="mt-3 flex flex-col gap-1">
              <p className="text-sm font-semibold text-foreground">{t("contact.email")}</p>
              <a
                href="mailto:support@electronics.pk"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                support@electronics.pk
              </a>
            </div>
          </div>

          <FooterColumn headingKey="footer.letUsHelpYou" links={helpLinks} />
          <FooterColumn headingKey="footer.categories" links={categoryLinks} />
          <FooterColumn headingKey="footer.getToKnowUs" links={aboutLinks} />
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} {t("site.name")}. {t("footer.copyright")}
            </p>
            <p>
              {t("checkout.codAvailable")} · {t("checkout.installationService")} ·{" "}
              {t("checkout.secureCheckout")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
