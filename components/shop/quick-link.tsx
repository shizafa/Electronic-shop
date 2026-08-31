import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

const THUMBNAIL_WIDTH = 110;
const THUMBNAIL_HEIGHT = 110;

interface QuickLinkProps {
  categories: Category[];
  products: Product[];
  activeCategoryIds?: string[];
}

// Shop-page quick category nav — links straight into /category/[slug], same thumbnail-fallback
// logic as components/home/category-tiles.tsx. activeCategoryIds marks a tile "selected" (blue
// ring around the circle): category-listing.tsx passes the current category's id, shop-listing.tsx
// passes whichever category checkboxes the user has ticked in the sidebar filter.
export function QuickLink({ categories, products, activeCategoryIds = [] }: QuickLinkProps) {
  return (
    <div className="rbt-component-area rbt-catagories-area pt--0 pt_sm--16 pt_md--16 rbt-bg-color-white">
      <div className="container">
        {/* Start Component Area */}
        <div className="row row--12 align-items-end rbt-tablet-row rbt-mobile-row">
          {categories.map((category, index) => {
            const thumbnail =
              category.thumbnailUrl ?? products.find((product) => product.categoryId === category.id)?.images[0];
            return (
              <div className="col-lg-1-8 col-md-2 col-sm-3 col-3" key={category.id}>
                <Link
                  className={`rbt-cat-box rbt-cat-box-1 rbt-cat-box-1-rounded text-center rbt-scroll-trigger fade_in animation-order-${index + 1}${activeCategoryIds.includes(category.id) ? " is-active" : ""}`}
                  href={`/category/${category.slug}`}
                >
                  <div className="inner">
                    <div className="rbt-image-portion">
                      {thumbnail && (
                        <Image
                          src={thumbnail}
                          alt={category.name}
                          width={THUMBNAIL_WIDTH}
                          height={THUMBNAIL_HEIGHT}
                        />
                      )}
                    </div>
                    <div className="content">
                      <p className="title">
                        {category.name}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
        {/* End Component Area */}
      </div>
    </div>
  );
}
