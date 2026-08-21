import { t } from "@/lib/i18n";
import { getDisplayVariant } from "@/lib/product-helpers";
import { getAllProducts } from "@/lib/products";
import type { Product } from "@/types/product";

function discountPercentFor(product: Product): number | undefined {
  const variant = getDisplayVariant(product);
  if (variant.compareAtPrice === undefined || variant.compareAtPrice <= variant.price) return undefined;
  return Math.round(((variant.compareAtPrice - variant.price) / variant.compareAtPrice) * 100);
}

// Homepage brand strip: real brands pulled from the catalog, with each tile's discount
// computed from that brand's actual products (not invented per-brand promo numbers)
export async function BrandLogos() {
  const products = await getAllProducts();

  const brands = new Map<string, { count: number; maxDiscount: number }>();
  for (const product of products) {
    const existing = brands.get(product.brand) ?? { count: 0, maxDiscount: 0 };
    const discount = discountPercentFor(product) ?? 0;
    brands.set(product.brand, {
      count: existing.count + 1,
      maxDiscount: Math.max(existing.maxDiscount, discount),
    });
  }

  const brandList = Array.from(brands.entries());
  if (brandList.length === 0) return null;

  return (
    <section className="container-page py-10">
      <h2 className="mb-6 text-xl font-semibold sm:text-2xl">{t("home.brands.heading")}</h2>

      <div className="grid grid-cols-2 gap-4 rounded-3xl bg-muted/40 p-4 sm:grid-cols-3 sm:p-6 lg:grid-cols-5">
        {brandList.map(([brand, { count, maxDiscount }], index) => (
          <div
            key={brand}
            className="animate-float flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-4 py-6 text-center transition-all duration-300 hover:scale-105 hover:border-primary/40 hover:shadow-lg hover:[animation-play-state:paused]"
            style={{ animationDelay: `${(index % 5) * 0.3}s` }}
          >
            <p className="text-lg font-bold text-foreground">{brand}</p>
            <span className="h-px w-8 bg-border" />
            <p className="text-sm text-muted-foreground">
              {maxDiscount > 0
                ? t("home.brands.upToOff").replace("{percent}", String(maxDiscount))
                : `${count} ${t("common.products").toLowerCase()}`}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
