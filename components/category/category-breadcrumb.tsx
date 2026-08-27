import Link from "next/link";
import type { Category } from "@/types/category";

interface CategoryBreadcrumbProps {
  category: Category;
}

// Same rbt-breadcrumb-two markup as components/shop/bread-crumb.tsx, with the trail
// extended one level (Home > Shop > category name) instead of ending at "Shop".
export function CategoryBreadcrumb({ category }: CategoryBreadcrumbProps) {
  return (
    <div className="rbt-breadcrumb-two rbt-bg-color-white">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="rbt-breadcrumb-inner text-left">
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
                    Shop
                  </Link>
                </li>
                <li>
                  <div className="icon-right">
                    <i className="fa-solid fa-chevron-right" />
                  </div>
                </li>
                <li className="rbt-breadcrumb-item active">
                  {category.name}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
