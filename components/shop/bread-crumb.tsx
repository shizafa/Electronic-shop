import Link from "next/link";

export function BreadCrumb() {
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
                  <a href="#">
                    Pages
                  </a>
                </li>
                <li>
                  <div className="icon-right">
                    <i className="fa-solid fa-chevron-right" />
                  </div>
                </li>
                <li className="rbt-breadcrumb-item active">
                  Shop
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
