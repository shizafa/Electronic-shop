import { t } from "@/lib/i18n";
import type { WhyShopFeature } from "@/lib/settings";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

// The template's Description tab originally included two decorative banner images and a
// demo video built around headphones-specific art (earbuds banner, "Immersive visuals"
// heading) with no per-product media field behind them — removed per instruction. What's left:
// the opening
// product.description, product.longDescription (admin-set, per product) as the body, and a
// 3-card feature row from store_settings' why_shop_features (admin-set, same row on every
// product).
const FEATURES_HEADING = "Why shop with us";

interface ProductDescriptionPanelProps {
  product: Product;
  category: Category;
  whyShopIntro: string | null;
  whyShopFeatures: WhyShopFeature[];
}

export function ProductDescriptionPanel({
  product,
  category,
  whyShopIntro,
  whyShopFeatures,
}: ProductDescriptionPanelProps) {
  const longDescriptionParagraphs = (product.longDescription ?? "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="rbt-product-single-description">
      <p className="rbt-block-desc b1 mb--0">
        {product.description}
      </p>

      {longDescriptionParagraphs.map((paragraph, index) => (
        <p className="rbt-block-desc b1 mb--0 mt--12" key={index}>
          {paragraph}
        </p>
      ))}

      <div className="rbt-prd-feature-area mt--32">
        <h2 className="rbt-block-title h6 mb--0">
          {FEATURES_HEADING}
        </h2>
        {whyShopIntro && (
          <p className="rbt-block-desc b1 mb--0 mt--12">
            {whyShopIntro}
          </p>
        )}
        <div className="row row--12 mt_dec--24 rbt-mobile-row mt--12">
          {whyShopFeatures.map((feature) => (
            <div className="col-lg-4 col-md-4 col-sm-6 col-12 mt--24" key={feature.title}>
              <div className="rbt-prd-feature-card rbt-bg-color-brand-50 rbt-curved-style-box">
                <div className="rbt-inner text-center">
                  <span className="icon">
                    <i className={feature.icon} />
                  </span>
                  <p className="title b1">
                    {feature.title}
                  </p>
                  <p className="desc b2">
                    {feature.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {category.installationRequired && (
        <p className="rbt-block-desc b1 mb--0 mt--32">
          <strong>{t("product.installationRequired")}:</strong> {t("product.installationNotice")}
        </p>
      )}
    </div>
  );
}
