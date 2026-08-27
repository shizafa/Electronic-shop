import Link from "next/link";
import { ProductListCard } from "@/components/product/product-list-card";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

interface ProductBreadcrumbProps {
  product: Product;
  category: Category;
  previousProduct?: Product;
  nextProduct?: Product;
}

// Breadcrumb trail + prev/next-in-category navigation for /product/[slug]. The hover-preview
// dropdowns are pure CSS (.rbt-event-hover:hover .rbt-dropdown), confirmed in style.min.css —
// no client component needed.
export function ProductBreadcrumb({ product, category, previousProduct, nextProduct }: ProductBreadcrumbProps) {
  return (
    <div className="rbt-breadcrumb-two rbt-bg-color-white">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="rbt-breadcrumb-inner d-flex align-items-center justify-content-between">
              <ul className="rbt-breadcrumb-page-list justify-content-start mt--0">
                <li className="rbt-breadcrumb-item">
                  <Link href="/">
                    Home
                  </Link>
                </li>
                <li>
                  <div className="icon-right">
                    <i className="fa-solid fa-chevron-right" />
                  </div>
                </li>
                <li className="rbt-breadcrumb-item">
                  <Link href="/shop">
                    Products
                  </Link>
                </li>
                <li>
                  <div className="icon-right">
                    <i className="fa-solid fa-chevron-right" />
                  </div>
                </li>
                <li className="rbt-breadcrumb-item">
                  <Link href={`/category/${category.slug}`}>
                    {category.name}
                  </Link>
                </li>
                <li>
                  <div className="icon-right">
                    <i className="fa-solid fa-chevron-right" />
                  </div>
                </li>
                <li className="rbt-breadcrumb-item active">
                  {product.name}
                </li>
              </ul>
              {(previousProduct ?? nextProduct) && (
                <div className="rbt-single-nav">
                  <div className="rbt-products-nav">
                    {previousProduct && (
                      <div className="rbt-event-hover tooltips" data-tooltip="Previous Product" data-tooltip-position="top">
                        <Link
                          className="rbt-product-nav-btn rbt-round-btn rbt-btn-prev"
                          href={`/product/${previousProduct.slug}`}
                          aria-label="Previous product"
                        >
                          <i className="fa-regular fa-chevron-left" />
                        </Link>
                        <div className="rbt-dropdown rbt-dropdown-from-right">
                          <ProductListCard product={previousProduct} variant="preview" />
                        </div>
                      </div>
                    )}
                    <Link
                      href="/shop"
                      className="rbt-product-nav-btn rbt-round-btn tooltips"
                      data-tooltip="Back To Products"
                      data-tooltip-position="top"
                    >
                      <i className="fa-regular fa-grid-2" />
                    </Link>
                    {nextProduct && (
                      <div className="rbt-event-hover tooltips" data-tooltip="Next Product" data-tooltip-position="top">
                        <Link
                          className="rbt-product-nav-btn rbt-round-btn rbt-btn-next"
                          href={`/product/${nextProduct.slug}`}
                          aria-label="Next product"
                        >
                          <i className="fa-regular fa-chevron-right" />
                        </Link>
                        <div className="rbt-dropdown rbt-dropdown-from-right">
                          <ProductListCard product={nextProduct} variant="preview" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
