import Link from "next/link";

// Shop-page banner (image + headline + CTA), unbacked marketing content — PLACEHOLDER: no
// campaign/promotions data model exists yet, same as components/home/promo-banner.tsx.
export function PromoBanner() {
  return (
    <div className="rbt-component-area rbt-page-banner-content">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="rbt-component-banner radius-8 rbt-scroll-trigger fade_in animation-order-1">
              <div className="mega-top-banner bg-three">
                <div className="rbt-banner-inner w-100">
                  <div className="rbt-banner-content">
                    <h2 className="title">
                      Buy One and Get 50% Off the Second Purchase Now
                    </h2>
                    <p className="b3 desc">
                      Send us your idea, it may appear on Unimart.
                    </p>
                  </div>
                  <div className="pricing-action d-flex align-items-center rbt-gap--8">
                    <div className="rbt-pricing-part d-flex">
                      <span className="rbt-price-text offer-price">
                        $189.00
                      </span>
                      <del className="rbt-dis-price-text">
                        $295.00
                      </del>
                    </div>
                    <Link className="rbt-btn rbt-btn-sm rbt-btn-black" href="/shop">
                      View Details
                    </Link>
                  </div>
                  <a href="#" className="product-img position-bottom d-none d-xl-block">
                    <img src="/assets/images/splash/menu-banner/menu-prd-01.webp" alt="Eccommerce Product" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
