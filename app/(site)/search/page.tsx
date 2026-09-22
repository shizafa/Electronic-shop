import type { Metadata } from "next";
import { SearchResults } from "@/components/search/search-results";
import { getVisibleCategories, getCategoryBySlug } from "@/lib/categories";
import { t } from "@/lib/i18n";
import { searchProducts } from "@/lib/products";

// Reads the "q" query string param, defaulting to an empty search
function getQuery(params: Awaited<PageProps<"/search">["searchParams"]>): string {
  return typeof params.q === "string" ? params.q : "";
}

// Reads the "category" query string param (a category slug, or "all"/absent for no scoping)
function getCategorySlug(params: Awaited<PageProps<"/search">["searchParams"]>): string | undefined {
  return typeof params.category === "string" && params.category !== "all" ? params.category : undefined;
}

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const query = getQuery(await searchParams);
  return { title: query ? `${t("search.resultsFor")} "${query}"` : t("nav.search") };
}

// /search route: runs the query from the URL against the product catalog, optionally scoped to a category
export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const resolvedParams = await searchParams;
  const query = getQuery(resolvedParams);
  const categorySlug = getCategorySlug(resolvedParams);
  const selectedCategory = categorySlug ? await getCategoryBySlug(categorySlug) : undefined;
  const [results, categories] = await Promise.all([
    searchProducts(query, selectedCategory?.id),
    getVisibleCategories(),
  ]);
  const visibleCategoryIds = new Set(categories.map((category) => category.id));
  const visibleResults = results.filter((product) => visibleCategoryIds.has(product.categoryId));

  return <SearchResults query={query} products={visibleResults} categories={categories} />;
}