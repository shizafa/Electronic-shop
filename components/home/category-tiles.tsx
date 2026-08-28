import Image from "next/image";
import Link from "next/link";
import { getVisibleCategories } from "@/lib/categories";
import { getAllProducts } from "@/lib/products";

const THUMBNAIL_WIDTH = 93;
const THUMBNAIL_HEIGHT = 93;

// PLACEHOLDER: the "Weekend Deal / DJI Ronin Action" promo card (right column) has no
// backing campaign data model. Kept verbatim, same treatment as the nav megamenu's promo
// card. TODO: wire to a real promotions/campaigns source once one exists.

// Homepage grid of category cards linking into /category/[slug]
export async function CategoryTiles() {
  const [categories, products] = await Promise.all([getVisibleCategories(), getAllProducts()]);

  const categoryTiles = categories.map((category) => {
    const inCategory = products.filter((product) => product.categoryId === category.id);
    const bestSellers = [...inCategory]
      .sort((a, b) => Number(b.featured) - Number(a.featured))
      .slice(0, 3);
    const thumbnail = category.thumbnailUrl ?? inCategory[0]?.images[0];
    return { category, bestSellers, thumbnail };
  });

  return (
    <div className="rbt-component-area rbt-catagories-area rbt-section-gap2 rbt-bg-color-white">
  <div className="container">
    <div className="row">
      <div className="col-lg-12 pr--0">
        <div className="rbt-component-section-title d-flex justify-content-between flex-row align-items-center p-0 mb--32 mb_sm--16 border-0">
          <h2 className="rbt-title rbt-scroll-trigger fade_in animation-order-1 h4">
            <span className="rbt-bold--text">
              Popular By Categories
            </span>
          </h2>
          <Link className="rbt-btn rbt-btn-secondary rbt-btn-sm-2 rbt-scroll-trigger fade_in animation-order-2 animated-icon-btn defalt-secondary-bg" href="/shop">
            <span className="btn-text">
              View All Categories
            </span>
            <span className="animated-icon ml--4">
              <svg className="icon_external" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15.5 15.5">
                <g className="icon-wrapper">
                  <path className="icon-rectangle" d="m7.75,0c.41,0,.75.34.75.75s-.34.75-.75.75H3.08c-.87,0-1.58.71-1.58,1.58v9.33c0,.87.71,1.58,1.58,1.58h9.33c.87,0,1.58-.71,1.58-1.58v-4.67c0-.41.34-.75.75-.75s.75.34.75.75v4.67c0,1.7-1.38,3.08-3.08,3.08H3.08c-1.7,0-3.08-1.38-3.08-3.08V3.08C0,1.38,1.38,0,3.08,0h4.67Z" strokeWidth="0">
                  </path>
                  <path className="icon-arrow-el-one" d="m15.5,0v4.29c0,.41-.34.75-.75.75s-.75-.34-.75-.75V1.5h-2.75c-.38,0-.69-.28-.74-.65v-.1c0-.41.33-.75.74-.75h4.25Z" strokeWidth="0" style={{ 'translate': 'none', 'rotate': 'none', 'scale': 'none', 'transformOrigin': '0px 0px 0px' }} data-svg-origin="15.5 0" transform="matrix(1,0,0,1,0,0)">
                  </path>
                  <path className="icon-arrow-line-one" d="m14.22.22c.29-.29.77-.29,1.06,0,.29.29.29.77,0,1.06L5.95,10.61c-.29.29-.77.29-1.06,0-.29-.29-.29-.77,0-1.06.4-.4.76-.76,1.09-1.09l.47-.47c.37-.37.7-.7,1-1l.34-.34.46-.46.41-.41c.74-.74,1.29-1.29,2.09-2.09l.61-.61c.17-.17.34-.34.53-.53.13-.13.25-.25.36-.36l.59-.59c.08-.08.16-.16.23-.23l.36-.36c.1-.1.19-.19.26-.26l.42-.42s.07-.07.11-.11Z" strokeWidth="0" style={{ 'translate': 'none', 'rotate': 'none', 'scale': 'none', 'transformOrigin': '0px 0px 0px' }} data-svg-origin="15.4975004196167 0.002499997615814209" transform="matrix(1,0,0,1,0,0)">
                  </path>
                  <path className="icon-arrow-el-two" d="m15.5,0v4.29c0,.41-.34.75-.75.75s-.75-.34-.75-.75V1.5h-2.75c-.38,0-.69-.28-.74-.65v-.1c0-.41.33-.75.74-.75h4.25Z" strokeWidth="0" style={{ 'translate': 'none', 'rotate': 'none', 'scale': 'none', 'transformOrigin': '0px 0px 0px' }} data-svg-origin="15.5 0" transform="matrix(1,0,0,1,0,0)">
                  </path>
                  <path className="icon-arrow-line-two" d="m14.22.22c.29-.29.77-.29,1.06,0,.29.29.29.77,0,1.06L5.95,10.61c-.29.29-.77.29-1.06,0-.29-.29-.29-.77,0-1.06.4-.4.76-.76,1.09-1.09l.47-.47c.37-.37.7-.7,1-1l.34-.34.46-.46.41-.41c.74-.74,1.29-1.29,2.09-2.09l.61-.61c.17-.17.34-.34.53-.53.13-.13.25-.25.36-.36l.59-.59c.08-.08.16-.16.23-.23l.36-.36c.1-.1.19-.19.26-.26l.42-.42s.07-.07.11-.11Z" strokeWidth="0" style={{ 'translate': 'none', 'rotate': 'none', 'scale': 'none', 'transformOrigin': '0px 0px 0px' }} data-svg-origin="15.4975004196167 0.002499997615814209" transform="matrix(1,0,0,1,0,0)">
                  </path>
                </g>
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </div>
    {/* Start Card Area */}
    <div className="rbt-catagories-section rbt-curved-style-box rbt-catagories-section-bg-one">
      <div className="row row--12 mt_dec--24">
        <div className="col-xl-8 col-lg-12 col-12 mt--24">
          <div className="row row--12 mt_dec--24 rbt-mobile-row">
            {categoryTiles.map(({ category, bestSellers, thumbnail }, index) => (
              <div className="col-lg-4 col-md-6 col-sm-6 col-6 mt--24" key={category.id}>
                <div className={`rbt-cat-box rbt-cat-box-7 rbt-scroll-trigger fade_in animation-order-${index + 1}`}>
                  <div className="inner">
                    <div className="content">
                      <h2 className="title h5">
                        <Link href={`/category/${category.slug}`}>
                          {category.name}
                        </Link>
                      </h2>
                      <ul className="quick-link-list rbt-link-hover">
                        {bestSellers.map((product) => (
                          <li key={product.id}>
                            <Link href={`/product/${product.slug}`} className="quick-link">
                              {product.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rbt-image-portion">
                      <Link href={`/category/${category.slug}`}>
                        {thumbnail && (
                          <Image
                            className="rbt-scroll-trigger"
                            src={thumbnail}
                            alt={category.name}
                            width={THUMBNAIL_WIDTH}
                            height={THUMBNAIL_HEIGHT}
                          />
                        )}
                      </Link>
                      <Link href={`/category/${category.slug}`} className="rbt-icon-overlay-link-btn">
                        <span className="rbt-btn-overlay">
                          <i className="rbt-icon fa-solid fa-arrow-up-right" />
                          <i className="rbt-icon-bottom fa-solid fa-arrow-up-right" />
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-xl-4 col-lg-12 col-12 mt--24">
          <div className="rbt-cat-box banner-card text-center rbt-curved-style-box rbt-catagories-img-bg rbt-scroll-trigger fade_in animation-order-5">
            <div className="inner">
              <div className="content">
                <p className="subtitle rbt-scroll-trigger fade_in animation-order-1">
                  Weekend Deal
                </p>
                <h2 className="rbt-title rbt-scroll-trigger fade_in animation-order-2 h4">
                  <a href="#">
                    <span className="rbt-bold--text">
                      DJI Ronin
                    </span>
                    Action
                  </a>
                </h2>
                <h3 className="secondary-title rbt-scroll-trigger fade_in animation-order-3">
                  Super holiday
                </h3>
              </div>
              <div className="rbt-image-portion">
                <a href="#">
                  <img className="rbt-scroll-trigger zoom_in animation-order-4" src="/assets/images/catagory-img/banner-cat-01.webp" alt="Catagory Image" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* End Card Area */}
  </div>
</div>
  );
}
