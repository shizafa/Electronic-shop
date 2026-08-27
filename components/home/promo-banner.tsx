import { PromoBannerMagneticButton } from "@/components/home/promo-banner-magnetic-button";

// Homepage single static promo banner (image + headline + CTA), unbacked marketing content —
// PLACEHOLDER: no campaign/promotions data model exists yet. TODO: wire to a real source
// once one exists, same as the category-tiles and megamenu promo cards.
export function PromoBanner() {
  return (
    <div className="container">
      <div className="row row--12">
        <div className="col-lg-12 col-md-12 col-sm-12 col-12 mt--32 mt_sm--0">
          <div className="rbt-product-banner rbt-product-banner-style-one">
            <div className="rbt-product-banner-img rbt-scroll-trigger zoom_in animation-order-1">
              <img src="/assets/images/product-banner/product-banner-img-01.webp" alt="Ecommerce Product Banner Image" />
            </div>
            <div className="rbt-banner-inner rbt-curved-style-box">
              <div className="rbt-product-banner-content">
                <div className="rbt-content-section rbt-scroll-trigger fade_in animation-order-1">
                  <p className="rbt-banner-subtitle mb-0">
                    Power Up Deals
                  </p>
                  <h2 className="rbt-banner-title title-capitalize-text mb-0">
                    <span className="rbt-bold--text">
                      New
                                      Device
                    </span>
                    coming Soon
                  </h2>
                  <h3 className="rbt-secondery-subtitle mb-0">
                    Land major deals
                  </h3>
                </div>
                <div className="rbt-banner-btn rbt-magnet-area rbt-banner-btn rbt-scroll-trigger fade_in animation-order-2">
                  <PromoBannerMagneticButton href="/shop" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
