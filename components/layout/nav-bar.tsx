import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getVisibleCategories } from "@/lib/categories";
import { getAllProducts } from "@/lib/products";
import { t } from "@/lib/i18n";

const navLinkClass =
  "flex items-center gap-1 rounded-md px-3 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10";

const moreLinks = [
  { href: "/faqs", labelKey: "footer.faqs" },
  { href: "/policies/shipping-installation", labelKey: "footer.shippingInstallation" },
  { href: "/policies/returns-warranty", labelKey: "footer.returnsWarranty" },
  { href: "/policies/privacy", labelKey: "footer.privacyPolicy" },
  { href: "/policies/terms", labelKey: "footer.termsOfService" },
];

// Site-wide secondary nav bar: Shop mega-menu (categories + top products), plus static links.
export async function NavBar() {
  const [categories, products] = await Promise.all([getVisibleCategories(), getAllProducts()]);

  const topProductsByCategory = categories.map((category) => {
    const inCategory = products.filter((product) => product.categoryId === category.id);
    const featuredFirst = [...inCategory].sort((a, b) => Number(b.featured) - Number(a.featured));
    return { category, topProducts: featuredFirst.slice(0, 4) };
  });

  return (
    <nav className="hidden border-b border-border bg-primary lg:block">
      <div className="container-page flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger className={navLinkClass}>
            {t("nav.shop")}
            <ChevronDown className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[min(92vw,900px)] p-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
              {topProductsByCategory.map(({ category, topProducts }) => (
                <div key={category.id}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-sm font-semibold text-foreground hover:text-primary"
                  >
                    {category.name}
                  </Link>
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {topProducts.length > 0 ? (
                      topProducts.map((product) => (
                        <li key={product.id}>
                          <Link
                            href={`/product/${product.slug}`}
                            className="text-sm text-muted-foreground hover:text-primary"
                          >
                            {product.name}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground/60">-</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-border pt-4">
              <Link href="/shop" className="text-sm font-medium text-primary hover:underline">
                {t("nav.showAllProducts")}
              </Link>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link href="/deals" className={navLinkClass}>
          {t("nav.deals")}
        </Link>

        <Link href="/about" className={navLinkClass}>
          {t("nav.aboutUs")}
        </Link>

        <Link href="/contact" className={navLinkClass}>
          {t("nav.contactUs")}
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className={navLinkClass}>
            {t("nav.more")}
            <ChevronDown className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {moreLinks.map((link) => (
              <DropdownMenuItem key={link.href} asChild>
                <Link href={link.href}>{t(link.labelKey)}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
