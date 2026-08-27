import { t } from "@/lib/i18n";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

// The template's Description tab is a rich layout (banner images, a video, a 3-card feature
// row) built around headphones-specific copy ("Microphone built-in", earbuds banner art, an
// "Immersive visuals" heading) that would misrepresent any other product in the catalog (a TV,
// an AC, ...). Per instruction, the layout/structure is kept as pasted — same paragraph count,
// banner, video, feature-card row — but the copy is replaced: the real product.description
// opens the panel, the filler paragraphs stay as neutral lorem-ipsum (harmless, doesn't assert
// anything product-specific), the banner/video stay as generic decorative demo art, and the 3
// feature cards were swapped for store-wide policy claims that are already real elsewhere in
// this app (shipping/returns copy matches ProductCard's PLACEHOLDER text) rather than invented
// per-product specs.
// TODO: replace the filler paragraphs and banner art with real per-product content if this
// section grows a real "long description" field.
const PLACEHOLDER = {
  fillerParagraphs: [
    "Quisque varius diam vel metus mattis, id aliquam diam rhoncus. Proin vitae magna in dui finibus malesuada et at nulla. Morbi elit ex, viverra vitae ante vel, blandit feugiat ligula. Fusce fermentum iaculis nibh, at sodales leo maximus a. Nullam ultricies sodales nunc, in pellentesque lorem mattis quis. Cras imperdiet est in nunc tristique lacinia. Nullam aliquam mauris eu accumsan tincidunt. Suspendisse velit ex, aliquet vel ornare vel, dignissim a tortor. Morbi ut sapien vitae odio accumsan gravida. Morbi vitae erat auctor, eleifend nunc a, lobortis neque. Praesent aliquam dignissim viverra. Maecenas lacus odio, feugiat eu nunc sit amet, maximus sagittis dolor.",
    "Nunc, in pellentesque lorem mattis quis. Cras imperdiet est in nunc tristique lacinia. Nullam aliquam mauris eu accumsan tincidunt. Suspendisse velit ex, aliquet vel ornare vel, dignissim a tortor. Morbi ut sapien vitae odio accumsan gravida. Morbi vitae erat auctor, eleifend nunc a, lobortis neque. Praesent aliquam dignissim viverra. Maecenas lacus odio, feugiat eu nunc sit.",
  ],
  fillerParagraphsAfterFeatures: [
    "Egestas purus a luctus ridiculus ac malesuada arcu a. Euismod dapibus commodo metus phasellus blandit suspendisse euismod orci tellus. Habitasse hendrerit dolor euismod varius nisi. Platea praesent nisi ultrices rhoncus volutpat nostra. Efficitur dui nec massa nulla nostra nunc massa ornare fermentum. Parturient turpis per adipiscing vestibulum donec tincidunt ligula. Purus tristique ut dolor mollis ut cras scelerisque nec. Massa dis mus senectus tortor ligula. Ullamcorper molestie placerat bibendum hac aptent volutpat ad laoreet.",
    "Scelerisque sociosqu sagittis bibendum quam id ultrices placerat adipiscing. Imperdiet egestas ullamcorper cras blandit himenaeos auctor lacus commodo. Feugiat quisque nascetur tincidunt duis phasellus, sagittis euismod. Donec nisl senectus risus nullam quisque vivamus. Dapibus pulvinar lobortis auctor quam neque. Nibh at maximus taciti mattis rutrum viverra.",
  ],
  featuresHeading: "Why shop with us",
  features: [
    {
      icon: "fa-regular fa-shield-check",
      title: "Genuine Product",
      desc: "100% authentic, sourced directly from authorized distributors.",
    },
    {
      icon: "fa-regular fa-truck",
      title: "Free Shipping",
      desc: "2–3 weeks free delivery nationwide on this item.",
    },
    {
      icon: "fa-regular fa-rotate-left",
      title: "7 Days Return",
      desc: "Free returns within 7 days of purchase.",
    },
  ],
};

interface ProductDescriptionPanelProps {
  product: Product;
  category: Category;
}

export function ProductDescriptionPanel({ product, category }: ProductDescriptionPanelProps) {
  return (
    <div className="rbt-product-single-description">
      <p className="rbt-block-desc b1 mb--0">
        {product.description}
      </p>

      <div className="rbt-block-banner-img mt--32">
        <img src="/assets/images/product-single/single-prd-banner/single-prd-banner-01.webp" alt="" />
      </div>

      {PLACEHOLDER.fillerParagraphs.map((paragraph, index) => (
        <p className="rbt-block-desc b1 mb--0 mt--12" key={index}>
          {paragraph}
        </p>
      ))}

      <div className="rbt-block-banner-video mt--32">
        <video src="/assets/videos/prd-single-dtls-video-01.mp4" muted loop autoPlay />
      </div>

      <div className="rbt-prd-feature-area mt--32">
        <h2 className="rbt-block-title h6 mb--0">
          {PLACEHOLDER.featuresHeading}
        </h2>
        <div className="row row--12 mt_dec--24 rbt-mobile-row mt--12">
          {PLACEHOLDER.features.map((feature) => (
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

      {PLACEHOLDER.fillerParagraphsAfterFeatures.map((paragraph, index) => (
        <p className="rbt-block-desc b1 mb--0 mt--12" key={index}>
          {paragraph}
        </p>
      ))}

      <div className="rbt-block-banner-img mt--32">
        <img src="/assets/images/product-single/single-prd-banner/single-prd-banner-02.webp" alt="" />
      </div>

      {category.installationRequired && (
        <p className="rbt-block-desc b1 mb--0 mt--32">
          <strong>{t("product.installationRequired")}:</strong> {t("product.installationNotice")}
        </p>
      )}
    </div>
  );
}
