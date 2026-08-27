<div className="rbt-search-dropdown rbt-common-search-dropdown-activation">
  <div className="wrapper">
    <div className="row">
      <div className="col-lg-12">
        <div className="rbt-component-section-title border-0 p-0 text-center">
          <h2 className="rbt-title text-start text-md-center">
            <span className="rbt-bold--text">
              Search For
                                Products
            </span>
          </h2>
        </div>
      </div>
    </div>
    <div className="row">
      <div className="col-lg-12">
        <form className="rbt-search-form">
          <div className="input-sectition position-relative w-100 mr--12 mr_sm--4">
            <input className="search-input" type="text" placeholder="What Are You Looking For?" />
            <i className="fa-sharp fa-regular inner-search-icon fa-magnifying-glass" />
            <button className="media-search-btn media-search-popupactivation">
              <i className="fa-sharp fa-regular fa-camera" />
            </button>
          </div>
          <div className="submit-btn">
            <a className="rbt-btn btn-md" href="#">
              Search
            </a>
          </div>
          <div className="rbt-media-search-section">
            <div className="rbt-media-wrapper">
              <div className="section-title">
                <span className="title b1">
                  Find product inspiration with Image
                                        Search
                </span>
              </div>
              <div className="rbt-file-upload-container">
                <input type="file" className="fileInput" multiple={true} hidden={true} />
                <div className="file-upload-area fileUploadArea">
                  <div className="file-upload-content">
                    <span className="rbt-icon">
                      <i className="fa-solid fa-cloud-arrow-up" />
                    </span>
                    <p className="rbt-title">
                      Drag & Drop Files Here
                      <span className="rbt-text-color-gray-400">
                        Or
                      </span>
                    </p>
                    <button className="browseFilesButton rbt-btn rbt-btn-sm">
                      Browse Files
                    </button>
                  </div>
                  <div className="fileList file-list" />
                </div>
                <p className="fileCount">
                  0 of 10
                </p>
              </div>
              <div className="rbt-copy-link-part rbt-text-copy-activation">
                <input className="rbt-copy-value-field" type="text" value="https://unimart.template/wishlist" readOnly={true} />
                <button className="rbt-btn rbt-btn-xs has-left-icon rbt-copy-btn" data-tooltip="Copy">
                  <i className="fa-regular fa-copy" />
                  <span className="rbt-btn-text">
                    Copy
                  </span>
                </button>
              </div>
              <button type="button" className="rbt-round-btn rbt-ms-dismiss-btn">
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          </div>
          <a href="javascript:void(0);" className="rbt-ms-dismiss-outsider" />
        </form>
      </div>
    </div>
    {/* "Popular searches" tag list, lines 3755-3778 — kept since it's tiny, not product-grid content */}
    <div className="rbt-search-scroll-vertical-wrapper rbt-scroll-vertical">
      <div className="inner">
        <div className="row row--0">
          <div className="col-lg-12">
            <div className="border-0 p-0 text-left title-sm-fsize">
              <h2 className="title">
                <span className="rbt-bold--text">
                  Popular searches
                </span>
              </h2>
            </div>
          </div>
          <div className="rbt-search-list-wrapper rbt-tag-list rbt-tag-list-rounded-lg">
            <a href="#">
              Fashion
            </a>
            <a href="#">
              Interior
            </a>
            <a href="#">
              Nature
            </a>
            <a href="#">
              Jewellery
            </a>
            <a href="#">
              Art
            </a>
            <a href="#">
              Aliexpress
            </a>
            <a href="#">
              Technology
            </a>
            <a href="#">
              Texture
            </a>
            <a href="#">
              Architecture
            </a>
            <a href="#">
              Business
            </a>
            <a href="#">
              Jewellery
            </a>
            <a href="#">
              Aliexpress
            </a>
          </div>
        </div>
        <div className="rbt-separator-mid ptb--24">
          <hr className="rbt-separator m-0" />
        </div>
        {/* Start Card Area (3784-4188): "Recently searched" product-card grid, skipped — you have ProductCard */}
      </div>
    </div>
  </div>
</div>
{/* End Search Dropdown */}