import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { ProductGrid } from "@/components/product/product-grid";
import { t } from "@/lib/i18n";
import type { Product } from "@/types/product";

interface ProductSectionProps {
  heading: string;
  viewAllHref?: string;
  products: Product[];
  badge?: string;
}

// Reusable homepage section that renders a heading plus a grid of products
export function ProductSection({ heading, viewAllHref, products, badge }: ProductSectionProps) {
  if (products.length === 0) return null; // hide the section entirely when there's nothing to show

  return (
    <section className="container-page py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold sm:text-2xl">{heading}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-sm font-medium text-primary hover:underline">
            {t("common.viewAll")}
          </Link>
        )}
      </div>

      <div className="mt-5">
        <ProductGrid>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} badge={badge} />
          ))}
        </ProductGrid>
      </div>
    </section>
  );
}