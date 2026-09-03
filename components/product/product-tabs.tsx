"use client";

import { useState } from "react";
import { ProductDescriptionPanel } from "@/components/product/product-description-panel";
import { ProductSpecificationPanel } from "@/components/product/product-specification-panel";
import { QASection } from "@/components/product/qa-section";
import { ReviewsSection } from "@/components/product/reviews-section";
import { t } from "@/lib/i18n";
import type { SpecRow } from "@/lib/specs";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import type { Review } from "@/types/review";

type TabId = "description" | "specification" | "reviews" | "question";

const TABS: { id: TabId; labelKey: string; panelId: string }[] = [
  { id: "description", labelKey: "product.description", panelId: "rbt-description" },
  { id: "specification", labelKey: "product.specifications", panelId: "rbt-specification" },
  { id: "reviews", labelKey: "product.reviews", panelId: "rbt-reviews" },
  { id: "question", labelKey: "product.qanda", panelId: "rbt-question" },
];

interface ProductTabsProps {
  product: Product;
  category: Category;
  specRows: SpecRow[];
  reviews: Review[];
}

// Rebuilds the template's Bootstrap tab widget (data-bs-toggle="tab") with React state, since
// Bootstrap JS isn't loaded in this project. This also means dropping the shadcn Tabs
// primitive that used to live here: its active-tab styling is driven by Radix's data-state
// attribute, but the template's decorative folder-tab corner shapes
// (.rbt-fshape-portion, confirmed in style.min.css) are gated on a literal .active class —
// two different mechanisms that don't compose, so plain state is simpler here. Matches
// CLAUDE.md's rule to drop components/ui/* imports as each section gets ported to the template.
export function ProductTabs({ product, category, specRows, reviews }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("description");

  return (
    <div className="col-12 mt--24">
      <div className="rbt-tab rbt-product-single-details-tab rbt-fshape-tab">
        <div className="rbt-tab-nav-wrapper">
          <ul className="nav nav-tabs" role="tablist">
            {/* Bootstrap's .nav is display:flex, and this scoped .rbt-fshape-tab .nav-tabs rule
                sets flex-wrap:nowrap + overflow-x:auto (a scrollable-tabs pattern) but never
                sets flex-shrink:0 on the items. Without it, default flex-shrink squeezes each
                tab narrower than its padding+label actually needs, so the absolutely-positioned
                .rbt-fshape-portion curve — sized off that shrunk box — lands mid-label instead
                of at the true text edge. flex-shrink can't be added to style.min.css (vendor
                file), so it's set inline here instead. */}
            {TABS.map((tab) => (
              <li className="nav-item" role="presentation" key={tab.id} style={{ flexShrink: 0 }}>
                <button
                  type="button"
                  id={`${tab.panelId}-tab`}
                  className={`nav-link${activeTab === tab.id ? " active" : ""}`}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={tab.panelId}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {t(tab.labelKey)}
                  <span className="rbt-fshape-portion rbt-fshape-left-portion">
                    <svg xmlns="http://www.w3.org/2000/svg" width="52" height="50" viewBox="0 0 52 50" fill="none">
                      <path className="rbt-svg-fill-one" d="M0.505402 49.9854C116.894 49.9991 -64.388 49.9777 52 49.9914C52 31.2633 52 20.7632 52 2.03504C40.8 1.63545 35.5357 4.56594 32.5357 10.5615L22.0357 38.5324C18.0017 47.9353 6.6182 49.4495 0.505402 49.9854Z" />
                      <path
                        className="rbt-svg-fill-two"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M38.793 1.97666C35.457 3.50832 33.2276 5.91092 31.6412 9.08146L31.6178 9.1283L21.1076 37.1263C18.9861 42.0545 15.232 44.7995 11.3024 46.3063C7.3457 47.8234 3.2411 48.0696 0.566002 47.9886C0.566002 47.9886 0.529102 49.2057 0.505402 49.9856C3.3303 50.0711 7.7257 49.8177 12.019 48.1715C16.3338 46.5171 20.5747 43.4403 22.9549 37.8925L22.9639 37.8713C22.9639 37.8713 32.0421 12.7293 33.4534 9.92838C34.8648 7.12739 36.7799 5.09976 39.6283 3.79203C43.5435 1.50049 52 2.03525 52 2.03525C52 20.7634 52 31.2635 52 49.9916L51.9982 0.0363376C46.331 -0.164216 42.0898 0.46304 38.793 1.97666Z"
                      />
                    </svg>
                  </span>
                  <span className="rbt-fshape-portion rbt-fshape-right-portion">
                    <svg xmlns="http://www.w3.org/2000/svg" width="52" height="50" viewBox="0 0 52 50" fill="none">
                      <path className="rbt-svg-fill-one" d="M51.5337 49.984C-64.8544 49.9977 116.427 49.9764 0.0390625 49.9901C0.0390625 31.262 0.0390625 20.7619 0.0390625 2.03378C11.2391 1.63419 16.5034 4.56468 19.5034 10.5602L30.0034 38.5311C34.0374 47.934 45.4209 49.4481 51.5337 49.984Z" />
                      <path
                        className="rbt-svg-fill-two"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M13.246 1.97519C16.582 3.50685 18.8114 5.90944 20.3979 9.07997L20.4213 9.12681L30.9315 37.1248C33.053 42.053 36.807 44.7979 40.7367 46.3047C44.6934 47.8219 48.798 48.068 51.4731 47.987C51.4731 47.987 51.51 49.2041 51.5337 49.984C48.7087 50.0695 44.3134 49.8162 40.02 48.17C35.7052 46.5155 31.4643 43.4388 29.0842 37.891L29.0751 37.8698C29.0751 37.8698 19.997 12.7279 18.5857 9.92689C17.1743 7.12591 15.2591 5.09828 12.4108 3.79055C8.49554 1.49902 0.0390625 2.03378 0.0390625 2.03378C0.0390625 20.7619 0.0390625 31.262 0.0390625 49.9901L0.0408325 0.0348727C5.70805 -0.16568 9.9493 0.461575 13.246 1.97519Z"
                      />
                    </svg>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="tab-content">
          {activeTab === "description" && (
            <div className="tab-pane fade show active" id="rbt-description" role="tabpanel" aria-labelledby="rbt-description-tab">
              <ProductDescriptionPanel product={product} category={category} />
            </div>
          )}
          {activeTab === "specification" && (
            <div className="tab-pane fade show active" id="rbt-specification" role="tabpanel" aria-labelledby="rbt-specification-tab">
              <ProductSpecificationPanel product={product} specRows={specRows} />
            </div>
          )}
          {activeTab === "reviews" && (
            <div className="tab-pane fade show active" id="rbt-reviews" role="tabpanel" aria-labelledby="rbt-reviews-tab">
              <ReviewsSection productId={product.id} reviews={reviews} />
            </div>
          )}
          {activeTab === "question" && (
            <div className="tab-pane fade show active" id="rbt-question" role="tabpanel" aria-labelledby="rbt-question-tab">
              <QASection questions={[]} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
