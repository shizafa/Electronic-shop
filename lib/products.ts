import { airConditionerProducts } from "@/data/products/air-conditioners";
import { mobilePhoneProducts } from "@/data/products/mobile-phones";
import { televisionProducts } from "@/data/products/televisions";
import type { Product, Variant } from "@/types/product";

const allProducts: Product[] = [
  ...airConditionerProducts,
  ...televisionProducts,
  ...mobilePhoneProducts,
];

export function getAllProducts(): Product[] {
  return allProducts;
}

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((product) => product.slug === slug);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return allProducts.filter((product) => product.categoryId === categoryId);
}

export function getVariantById(variantId: string): Variant | undefined {
  for (const product of allProducts) {
    const variant = product.variants.find((candidate) => candidate.id === variantId);
    if (variant) return variant;
  }
  return undefined;
}

export function getFeaturedProducts(): Product[] {
  return allProducts.filter((product) => product.featured);
}

export function searchProducts(query: string): Product[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  return allProducts.filter((product) =>
    `${product.name} ${product.brand}`.toLowerCase().includes(normalizedQuery)
  );
}