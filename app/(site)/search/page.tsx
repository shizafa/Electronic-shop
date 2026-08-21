import type { Metadata } from "next";
import { SearchResults } from "@/components/search/search-results";
import { getAllCategories } from "@/lib/categories";
import { t } from "@/lib/i18n";
import { searchProducts } from "@/lib/products";

// Reads the "q" query string param, defaulting to an empty search
function getQuery(params: Awaited<PageProps<"/search">["searchParams"]>): string {
  return typeof params.q === "string" ? params.q : "";
}

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const query = getQuery(await searchParams);
  return { title: query ? `${t("search.resultsFor")} "${query}"` : t("nav.search") };
}

// /search route: runs the query from the URL against the product catalog
export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const query = getQuery(await searchParams);
  const [results, categories] = await Promise.all([searchProducts(query), getAllCategories()]);

  return <SearchResults query={query} products={results} categories={categories} />;
}