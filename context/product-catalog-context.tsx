"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapCategoryRow, mapProductRow } from "@/lib/supabase/mappers";
import type { Category } from "@/types/category";
import type { Product, Variant } from "@/types/product";

// Shape of the full-catalog cache exposed to client components that have no server-rendered
// parent supplying product/category data directly (cart, compare, wishlist, checkout).
interface ProductCatalogContextValue {
  isLoading: boolean;
  products: Product[];
  categories: Category[];
  getProductById: (id: string) => Product | undefined;
  getVariantById: (id: string) => Variant | undefined;
  getCategoryById: (id: string) => Category | undefined;
}

const ProductCatalogContext = createContext<ProductCatalogContextValue | undefined>(undefined);

// Fetches the whole catalog once on mount and caches it — the catalog is small (a few dozen
// products across 3 categories), so this is simpler than per-component fetching or a client-side
// data library, and keeps the sync lookup functions these components were already written against.
export function ProductCatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    Promise.all([
      supabase.from("products").select("*, variants(*)"),
      supabase.from("categories").select("*, spec_fields(*)"),
    ]).then(([productsResult, categoriesResult]) => {
      if (!active) return;
      if (productsResult.error) {
        console.error("ProductCatalogProvider: failed to load products", productsResult.error);
      }
      if (categoriesResult.error) {
        console.error("ProductCatalogProvider: failed to load categories", categoriesResult.error);
      }
      setProducts((productsResult.data ?? []).map(mapProductRow));
      setCategories((categoriesResult.data ?? []).map(mapCategoryRow));
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, []);

  function getProductById(id: string): Product | undefined {
    return products.find((product) => product.id === id);
  }

  function getVariantById(id: string): Variant | undefined {
    for (const product of products) {
      const variant = product.variants.find((candidate) => candidate.id === id);
      if (variant) return variant;
    }
    return undefined;
  }

  function getCategoryById(id: string): Category | undefined {
    return categories.find((category) => category.id === id);
  }

  return (
    <ProductCatalogContext.Provider
      value={{ isLoading, products, categories, getProductById, getVariantById, getCategoryById }}
    >
      {children}
    </ProductCatalogContext.Provider>
  );
}

// Hook to access the cached catalog from any component inside ProductCatalogProvider
export function useProductCatalog(): ProductCatalogContextValue {
  const context = useContext(ProductCatalogContext);
  if (!context) throw new Error("useProductCatalog must be used within a ProductCatalogProvider");
  return context;
}
