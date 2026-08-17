import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/product-detail";
import { getCategoryById } from "@/lib/categories";
import { t } from "@/lib/i18n";
import { getProductBySlug, getProductsByCategory } from "@/lib/products";

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  return { title: product ? product.name : "Product" };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = getCategoryById(product.categoryId);
  if (!category) notFound();

  const relatedProducts = getProductsByCategory(category.id)
    .filter((candidate) => candidate.id !== product.id)
    .slice(0, 4);

  return (
    <div className="container-page py-6">
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
      >
        <Link href="/" className="hover:text-foreground">
          {t("nav.home")}
        </Link>
        <span>/</span>
        <Link href={`/category/${category.slug}`} className="hover:text-foreground">
          {t(category.nameKey)}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <ProductDetail product={product} category={category} relatedProducts={relatedProducts} />
    </div>
  );
}