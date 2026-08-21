import type { Metadata } from "next";
import { ShopListing } from "@/components/shop/shop-listing";
import { getAllCategories } from "@/lib/categories";
import { t } from "@/lib/i18n";
import { getAllProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: t("shop.title"),
};

// /shop route: every product across every category, with category + spec + price filters
export default async function ShopPage() {
  const [products, categories] = await Promise.all([getAllProducts(), getAllCategories()]);

  return <ShopListing products={products} categories={categories} />;
}
