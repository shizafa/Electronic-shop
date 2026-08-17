import { airConditionerProducts } from "@/data/products/air-conditioners";
import { mobilePhoneProducts } from "@/data/products/mobile-phones";
import { televisionProducts } from "@/data/products/televisions";
import type { Product, Variant } from "@/types/product";

const allProducts: Product[] = [
  ...airConditionerProducts,
  ...televisionProducts,
  ...mobilePhoneProducts,
];

// Returns every product across all categories (mock data, no backend)
export function getAllProducts(): Product[] {
  return allProducts;
}

// Looks up a product by its URL-friendly slug
export function getProductBySlug(slug: string): Product | undefined {
  return allProducts.find((product) => product.slug === slug);
}

// Looks up a product by its id
export function getProductById(productId: string): Product | undefined {
  return allProducts.find((product) => product.id === productId);
}

// Returns all products belonging to a category
export function getProductsByCategory(categoryId: string): Product[] {
  return allProducts.filter((product) => product.categoryId === categoryId);
}

// Finds a specific variant (e.g. a color/size option) by searching every product
export function getVariantById(variantId: string): Variant | undefined {
  for (const product of allProducts) {
    const variant = product.variants.find((candidate) => candidate.id === variantId);
    if (variant) return variant;
  }
  return undefined;
}

// Returns products flagged as featured, for homepage highlights
export function getFeaturedProducts(): Product[] {
  return allProducts.filter((product) => product.featured);
}

// Case-insensitive search across product name and brand
export function searchProducts(query: string): Product[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  return allProducts.filter((product) =>
    `${product.name} ${product.brand}`.toLowerCase().includes(normalizedQuery)
  );
}

// Picks the variant shown by default on a product card: cheapest among in-stock ones (or cheapest overall if none in stock)
export function getDisplayVariant(product: Product): Variant {
  const inStockVariants = product.variants.filter((variant) => variant.stock > 0);
  const candidates = inStockVariants.length > 0 ? inStockVariants : product.variants;
  return candidates.reduce((cheapest, variant) => (variant.price < cheapest.price ? variant : cheapest));
}

// Builds a human-readable label for a variant, e.g. "128GB • Black"
export function formatVariantLabel(product: Product, variant: Variant): string {
  return product.variantAxes
    .map((axis) => {
      const value = variant.axisValues[axis.id];
      if (!axis.unit) return value;
      return axis.unit === '"' ? `${value}${axis.unit}` : `${value} ${axis.unit}`; // no space before " (inches)
    })
    .join(" • ");
}