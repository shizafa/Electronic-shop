import { PromoBannerMagneticButton } from "@/components/home/promo-banner-magnetic-button";
import { ProductListCard } from "@/components/product/product-list-card";
import type { Product } from "@/types/product";

interface WeekHighlightsProps {
  products: Product[];
}

const HIGHLIGHT_COUNT = 6;

// PLACEHOLDER: the right-side "Red Camera Plus / Holiday Cheers" promo card has no backing
// campaign data model, same as the other promo banners. TODO: wire to a real source.
export function WeekHighlights({ products }: WeekHighlightsProps) {
  const highlights = products.slice(0, HIGHLIGHT_COUNT);

  return (
    <div id="rbt-product-block-03" className="rbt-component-area rbt-catagories-area rbt-section-gap2 rbt-bg-color-gray-light">
      <div className="container">
        <div className="row row--12 mt_dec--24">
          <div className="col-xl-6 col-lg-12 col-md-12 col-12 mt--24">
            <div className="rbt-fshape-box-outline-style rbt-fshape-box-outline-style-bg-white rbt-fshape-box-outline-style-sm-size">
              <div className="row">
                <div className="col-lg-12">
                  <div className="rbt-component-section-title">
                    <h2 className="rbt-title rbt-scroll-trigger fade_in animation-order-1">
                      <span className="rbt-bold--text">
                        This Week’s Highlights
                      </span>
                    </h2>
                    <span className="rbt-fshape-right-portion rbt-fshape-right-portion-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="52" height="50" viewBox="0 0 52 50" fill="none">
                        <path d="M51.5337 49.984C-64.8544 49.9977 116.427 49.9764 0.0390625 49.9901C0.0390625 31.262 0.0390625 20.7619 0.0390625 2.03378C11.2391 1.63419 16.5034 4.56468 19.5034 10.5602L30.0034 38.5311C34.0374 47.934 45.4209 49.4481 51.5337 49.984Z" fill="var(--color-white)" />
                        <path fillRule="evenodd" clipRule="evenodd" d="M13.246 1.97519C16.582 3.50685 18.8114 5.90944 20.3979 9.07997L20.4213 9.12681L30.9315 37.1248C33.053 42.053 36.807 44.7979 40.7367 46.3047C44.6934 47.8219 48.798 48.068 51.4731 47.987C51.4731 47.987 51.51 49.2041 51.5337 49.984C48.7087 50.0695 44.3134 49.8162 40.02 48.17C35.7052 46.5155 31.4643 43.4388 29.0842 37.891L29.0751 37.8698C29.0751 37.8698 19.997 12.7279 18.5857 9.92689C17.1743 7.12591 15.2591 5.09828 12.4108 3.79055C8.49554 1.49902 0.0390625 2.03378 0.0390625 2.03378C0.0390625 20.7619 0.0390625 31.262 0.0390625 49.9901L0.0408325 0.0348727C5.70805 -0.16568 9.9493 0.461575 13.246 1.97519Z" fill="var(--color-brand-100)" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
              <div className="rbt-fshape-box">
                <div className="row row--12 mt_dec--24 rbt-card-row-has-top-separator rbt-two-align-card-row">
                  {highlights.map((product) => (
                    <ProductListCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-6 col-lg-12 col-md-12 col-12 mt--24 pt--44 pt_sm--0 pt_lg--0 pt_md--0">
            {/* Start Product Banner Area */}
            <div className="rbt-product-banner rbt-product-banner-style-two rbt-curved-style-box h-100">
              <div className="rbt-banner-inner h-100">
                <div className="rbt-product-banner-img rbt-full-width-img rbt-scroll-trigger zoom_in animation-order-1">
                  <img src="/assets/images/product-banner/product-banner-img-02.webp" alt="Ecommerce Product Banner Image" />
                </div>
                <div className="rbt-product-banner-content">
                  <div className="rbt-content-section rbt-scroll-trigger fade_in animation-order-1">
                    <p className="rbt-banner-subtitle mb-0">
                      Power Up Deals
                    </p>
                    <h2 className="rbt-banner-title title-capitalize-text mb-0">
                      <span className="rbt-bold--text">
                        Red Camera
                      </span>
                      Plus
                    </h2>
                    <h3 className="rbt-secondery-subtitle mb-0">
                      Holiday Cheers
                    </h3>
                  </div>
                  <div className="rbt-banner-btn rbt-scroll-trigger fade_in animation-order-2">
                    <PromoBannerMagneticButton href="/shop" />
                  </div>
                </div>
              </div>
            </div>
            {/* End Product Banner Area */}
          </div>
        </div>
      </div>
    </div>
  );
}
