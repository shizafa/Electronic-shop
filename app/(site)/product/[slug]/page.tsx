import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductBreadcrumb } from "@/components/product/product-breadcrumb";
import { ProductDetail } from "@/components/product/product-detail";
import { getCategoryById } from "@/lib/categories";
import { getProductBySlug, getProductsByCategory } from "@/lib/products";
import { getApprovedReviewsForProduct } from "@/lib/reviews";
import { getSettings } from "@/lib/settings";

// Sets the tab title to the matched product's name
export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product ? product.name : "Product" };
}

// /product/[slug] route: looks up the product and its category, then renders detail + related items
export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound(); // unknown slug -> 404
  if (product.variants.length === 0) notFound(); // no variants -> nothing sellable to show, same guard ProductCard applies

  const category = await getCategoryById(product.categoryId);
  if (!category) notFound(); // data integrity guard, shouldn't normally happen

  // Ordered deterministically (by id) so "previous"/"next" is stable across requests —
  // Supabase doesn't guarantee row order without an explicit .order().
  const categoryProducts = (await getProductsByCategory(category.id)).sort((a, b) =>
    a.id.localeCompare(b.id)
  );
  const currentIndex = categoryProducts.findIndex((candidate) => candidate.id === product.id);
  const hasSiblings = categoryProducts.length > 1;
  const previousProduct = hasSiblings
    ? categoryProducts[(currentIndex - 1 + categoryProducts.length) % categoryProducts.length]
    : undefined;
  const nextProduct = hasSiblings
    ? categoryProducts[(currentIndex + 1) % categoryProducts.length]
    : undefined;

  // Up to 4 other products from the same category, excluding this one
  const relatedProducts = categoryProducts.filter((candidate) => candidate.id !== product.id).slice(0, 4);
  const reviews = await getApprovedReviewsForProduct(product.id);
  const settings = await getSettings();

  return (
    <div>
      <ProductBreadcrumb
        product={product}
        category={category}
        previousProduct={previousProduct}
        nextProduct={nextProduct}
      />

      <ProductDetail
        product={product}
        category={category}
        relatedProducts={relatedProducts}
        reviews={reviews}
        whyShopIntro={settings.whyShopIntro}
        whyShopFeatures={settings.whyShopFeatures}
      />
    </div>
  );
}