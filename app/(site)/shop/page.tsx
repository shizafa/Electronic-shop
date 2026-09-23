import type { Metadata } from "next";
import { Suspense } from "react";
import { BreadCrumb } from "@/components/shop/bread-crumb";
import { ShopListing } from "@/components/shop/shop-listing";
import { getVisibleCategories } from "@/lib/categories";
import { t } from "@/lib/i18n";
import { getAllProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: t("shop.title"),
};

// /shop route: every product across every category, with category + spec + price filters
export default async function ShopPage() {
  const [allProducts, categories] = await Promise.all([getAllProducts(), getVisibleCategories()]);
  const visibleCategoryIds = new Set(categories.map((category) => category.id));
  const products = allProducts.filter((product) => visibleCategoryIds.has(product.categoryId));

  return (
    <>
      <BreadCrumb />
      {/* ShopListing reads its filters from the query string (useSearchParams), which this page
          otherwise renders statically — the boundary lets the shell prerender either way. */}
      <Suspense>
        <ShopListing products={products} categories={categories} />
      </Suspense>
    </>
  );
}
