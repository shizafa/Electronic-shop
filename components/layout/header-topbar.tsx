import Link from "next/link";
import { HeaderTopbarTicker, type TopbarTickerSlide } from "@/components/layout/header-topbar-ticker";
import { activeCurrency, currencies } from "@/data/currencies";

// The store currently supports exactly one currency (PKR) and one locale (en) — see
// data/currencies.ts and types/i18n.ts. The template's dropdowns assume several, so rather
// than inventing fake currencies/languages to fill out the sub-menu, each dropdown lists
// only the one real option. Swap PLACEHOLDER.locale for a real locale-label lookup if a
// second language is ever added; there's nowhere in lib/i18n.ts to read that from today.
// TODO: wire to backend
const PLACEHOLDER = {
  tickerSlides: [
    { text: "Big discounts on home appliances this week.", linkLabel: "Know more", href: "/deals" },
  ] satisfies TopbarTickerSlide[],
  storeLocationHref: "/contact",
  locale: { code: "en", label: "English", flag: "/assets/images/icons/eng.webp" },
};

const currencyDefinition = currencies[activeCurrency];

// Topbar — trending-now ticker plus store location / order tracking / currency / language.
// Sits above the main header bar (.rbt-header-wrapper), matching the template's
// .rbt-topbar-section. Fully static apart from the ticker, so it stays server-rendered.
export function HeaderTopbar() {
  return (
    <div className="rbt-topbar-section rbt-topbar-one">
      <div className="container">
        <div className="row align-items-center d-none d-md-flex mlr--0 row--0">
          <div className="col-lg-6 col-md-6 col-12">
            <div className="rbt-fancy-item fancy-menu-text fancy-menu-start">
              <div className="rbt-fancy-text">
                <strong>
                  Trending Now :
                </strong>
                <HeaderTopbarTicker slides={PLACEHOLDER.tickerSlides} />
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-md-6 col-12">
            <div className="rbt-header-sec-col rbt-header-right rbt-fancy-item fancy-menu-address fancy-menu-end">
              <div className="rbt-header-content m--0">
                <ul className="rbt-quick-access d-none d-lg-flex">
                  <li className="rbt-access-box">
                    <div className="header-info">
                      <Link href={PLACEHOLDER.storeLocationHref} className="rbt-access-link">
                        Store Location
                      </Link>
                    </div>
                    <div className="header-info">
                      <Link href="/account/orders" className="rbt-access-link">
                        Track Your Order
                      </Link>
                    </div>
                    <div className="header-info">
                      <ul className="rbt-dropdown-menu rbt-dropdown-menu-elastic currency-menu">
                        <li className="has-child-menu active-on-hover">
                          <a href="#">
                            <span className="menu-item">
                              {currencyDefinition.symbol}
                              {currencyDefinition.code}
                            </span>
                            <i className="right-icon fa-regular fa-chevron-down" />
                          </a>
                          <ul className="sub-menu hover-reverse">
                            <li>
                              <a href="#" className="active">
                                <span className="menu-item">
                                  {currencyDefinition.symbol}
                                  {currencyDefinition.code}
                                </span>
                              </a>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                    <div className="header-info">
                      <ul className="rbt-dropdown-menu rbt-dropdown-menu-elastic switcher-language">
                        <li className="has-child-menu active-on-hover">
                          <a href="#">
                            <img className="left-image" src={PLACEHOLDER.locale.flag} alt="Language" />
                            <span className="menu-item">
                              {PLACEHOLDER.locale.label}
                            </span>
                            <i className="right-icon fa-regular fa-chevron-down" />
                          </a>
                          <ul className="sub-menu">
                            <li>
                              <a href="#" className="active">
                                <img className="left-image" src={PLACEHOLDER.locale.flag} alt="Language" />
                                <span className="menu-item">
                                  {PLACEHOLDER.locale.label}
                                </span>
                              </a>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
