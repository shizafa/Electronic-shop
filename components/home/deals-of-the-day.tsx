import { ProductCard } from "@/components/product/product-card";
import { ProductGrid } from "@/components/product/product-grid";
import { getDisplayVariant } from "@/lib/product-helpers";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import { DealsOfTheDayTabs } from "@/components/home/deals-of-the-day-tabs";

interface DealsOfTheDayProps {
  products: Product[];
  categories: Category[];
}

const TAB_PRODUCT_LIMIT = 8;

function renderGrid(products: Product[], categories: Category[], priorityCount: number) {
  return (
    <ProductGrid priorityCount={priorityCount}>
      {products.map((product) => {
        const category = categories.find((candidate) => candidate.id === product.categoryId);
        return (
          <ProductCard
            key={product.id}
            product={product}
            categoryName={category?.name}
            categorySlug={category?.slug}
          />
        );
      })}
    </ProductGrid>
  );
}

// Homepage "Deals of The Day" section: same product data used elsewhere on the page
// (featured products, non-featured as "new arrivals", anything with a live discount as
// "on sale" — same definition as /deals), split across three tabs instead of one list.
//
// Always rendered below-the-fold via DealsOfTheDayLazy, so no tab gets priority-loaded images
// — by the time this mounts, nothing here is above the fold to begin with.
export function DealsOfTheDay({ products, categories }: DealsOfTheDayProps) {
  const bestSellers = products.filter((product) => product.featured).slice(0, TAB_PRODUCT_LIMIT);
  const newArrivals = products.filter((product) => !product.featured).slice(0, TAB_PRODUCT_LIMIT);
  const onSale = products
    .filter((product) => getDisplayVariant(product)?.compareAtPrice !== undefined)
    .slice(0, TAB_PRODUCT_LIMIT);

  return (
    <div id="rbt-product-block-01" className="rbt-component-area rbt-catagories-area rbt-section-gap2 rbt-bg-color-gray-light">
      <DealsOfTheDayTabs
        bestSellers={renderGrid(bestSellers, categories, 0)}
        newArrivals={renderGrid(newArrivals, categories, 0)}
        onSale={renderGrid(onSale, categories, 0)}
        viewAllHref="/deals"
      />
    </div>
  );
}
