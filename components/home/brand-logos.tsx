import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { t } from "@/lib/i18n";
import { getDisplayVariant } from "@/lib/product-helpers";
import { getAllProducts } from "@/lib/products";
import type { Product } from "@/types/product";

const BRAND_LOGO_DIR = path.join(process.cwd(), "public", "assets", "images", "brands");
const BRAND_LOGO_EXTENSIONS = ["webp", "png", "jpg", "jpeg"];

function discountPercentFor(product: Product): number | undefined {
  const variant = getDisplayVariant(product);
  if (variant.compareAtPrice === undefined || variant.compareAtPrice <= variant.price) return undefined;
  return Math.round(((variant.compareAtPrice - variant.price) / variant.compareAtPrice) * 100);
}

// Upload a brand's logo to /public/assets/images/brands/{slug}.{ext}, where {slug} is the
// brand name lowercased with runs of non-alphanumeric characters collapsed to a single "-"
// (e.g. "Sony" -> "sony", "Gree" -> "gree") and {ext} is whatever format the file is in —
// webp/png/jpg/jpeg are all resolved automatically, since real uploads arrived as a mix.
function slugifyBrand(brand: string): string {
  return brand
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveBrandLogo(brand: string): string | undefined {
  const slug = slugifyBrand(brand);
  const extension = BRAND_LOGO_EXTENSIONS.find((candidate) =>
    fs.existsSync(path.join(BRAND_LOGO_DIR, `${slug}.${candidate}`))
  );
  return extension ? `/assets/images/brands/${slug}.${extension}` : undefined;
}

// Homepage brand strip: real brands pulled from the catalog, with each tile's discount
// computed from that brand's actual products (not invented per-brand promo numbers)
export async function BrandLogos() {
  const products = await getAllProducts();

  const brands = new Map<string, { count: number; maxDiscount: number }>();
  for (const product of products) {
    const existing = brands.get(product.brand) ?? { count: 0, maxDiscount: 0 };
    const discount = discountPercentFor(product) ?? 0;
    brands.set(product.brand, {
      count: existing.count + 1,
      maxDiscount: Math.max(existing.maxDiscount, discount),
    });
  }

  // Template ships exactly 10 brand tiles; show the 10 brands with the most products.
  const brandList = Array.from(brands.entries())
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10);
  if (brandList.length === 0) return null;

  return (
    <div className="rbt-component-area rbt-catagories-area rbt-section-gap2 rbt-bg-color-gray-light">
      <div className="container">
        {/* Start Brands Area */}
        <div className="rbt-brand-style-one rbt-fshape-box-outline-style rbt-fshape-box-outline-style-extend-width">
          <div className="row">
            <div className="col-lg-12">
              <div className="rbt-component-section-title text-left">
                <h2 className="rbt-title rbt-scroll-trigger fade_in animation-order-1 h4">
                  <span className="rbt-bold--text">
                    Favorite
                            Brands
                  </span>
                </h2>
                <span className="rbt-fshape-right-portion">
                  <svg xmlns="http://www.w3.org/2000/svg" width="52" height="50" viewBox="0 0 52 50" fill="none">
                    <path d="M51.5337 49.984C-64.8544 49.9977 116.427 49.9764 0.0390625 49.9901C0.0390625 31.262 0.0390625 20.7619 0.0390625 2.03378C11.2391 1.63419 16.5034 4.56468 19.5034 10.5602L30.0034 38.5311C34.0374 47.934 45.4209 49.4481 51.5337 49.984Z" fill="var(--color-gray-light)" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M13.246 1.97519C16.582 3.50685 18.8114 5.90944 20.3979 9.07997L20.4213 9.12681L30.9315 37.1248C33.053 42.053 36.807 44.7979 40.7367 46.3047C44.6934 47.8219 48.798 48.068 51.4731 47.987C51.4731 47.987 51.51 49.2041 51.5337 49.984C48.7087 50.0695 44.3134 49.8162 40.02 48.17C35.7052 46.5155 31.4643 43.4388 29.0842 37.891L29.0751 37.8698C29.0751 37.8698 19.997 12.7279 18.5857 9.92689C17.1743 7.12591 15.2591 5.09828 12.4108 3.79055C8.49554 1.49902 0.0390625 2.03378 0.0390625 2.03378C0.0390625 20.7619 0.0390625 31.262 0.0390625 49.9901L0.0408325 0.0348727C5.70805 -0.16568 9.9493 0.461575 13.246 1.97519Z" fill="var(--color-brand-100)" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
          <div className="rbt-fshape-box rbt-fshape-box-py-inc">
            <div className="row row--12 mt_dec--24">
              {brandList.map(([brandName, { maxDiscount }]) => {
                const logoSrc = resolveBrandLogo(brandName);
                return (
                <div className="col-lg-1-5 col-lg-4 col-md-4 col-sm-6 col-6 mt--24" key={brandName}>
                  <div className="rbt-brand text-center style-one rbt-scroll-trigger fade_in animation-order-1">
                    <Link href={`/search?q=${encodeURIComponent(brandName)}`}>
                      <div className="rbt-brand-inner">
                        <div className="brand-image">
                          {logoSrc && (
                            <Image
                              src={logoSrc}
                              alt={brandName}
                              fill
                              style={{ objectFit: "contain" }}
                            />
                          )}
                          <span className="rbt-divider-arrow" />
                        </div>
                        <div className="rbt-content">
                          {maxDiscount > 0 && (
                            <span className="discount-text">
                              {t("home.brands.upToOff").replace("{percent}", String(maxDiscount))}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* End Brands Area */}
      </div>
    </div>
  );
}
