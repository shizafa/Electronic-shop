"use client";

import type { ReactNode } from "react";
import type { SortOption } from "@/lib/filters";

// UI-only quick filters — not wired to real criteria yet (no ratings/color/"popularity" data
// exists in the schema). They toggle visually and show as removable chips; filtering logic
// for each will be added once that data exists. The pasted markup's fast-filter row repeats
// "Top Rated" a second time (same iconClass/label as entry 3) — dropped as a template typo,
// there's no 8th distinct concept behind it.
const FAST_FILTERS = [
  { id: "featured", label: "Featured", iconClass: "fa-regular fa-truck-fast" },
  { id: "bestSellers", label: "Best Sellers", iconClass: "fa-sharp fa-regular fa-stars" },
  { id: "topRated", label: "Top Rated", iconClass: "fa-regular fa-badge-check" },
  { id: "new", label: "New", iconClass: "fa-regular fa-money-bill" },
  { id: "topItems", label: "Top Items", iconClass: "fa-sharp fa-regular fa-calendar-days" },
  { id: "popularItem", label: "Popular Item", iconClass: "fa-sharp fa-regular fa-stars" },
  { id: "bestColors", label: "Best Colors", iconClass: "fa-regular fa-palette" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Sort by featured" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name_asc", label: "Name: A-Z" },
];

const PAGE_SIZE_OPTIONS = [16, 12, 8, 4, 2];

interface ShopToolbarProps {
  total: number;
  pageStart: number;
  pageEnd: number;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  activeFastFilterIds: string[];
  onToggleFastFilter: (id: string) => void;
  onClearAll: () => void;
  onOpenFilterDrawer: () => void;
  // Product grid + pagination render inside this same col-xl-9 column, after the toolbar
  // controls — they aren't part of the pasted shop-toolbar markup, but the layout needs them
  // in this column rather than as a sibling (a second col-xl-9 would wrap onto its own row
  // and leave the sidebar column not spanning down beside it).
  children?: ReactNode;
}

export function ShopToolbar({
  total,
  pageStart,
  pageEnd,
  sort,
  onSortChange,
  pageSize,
  onPageSizeChange,
  searchQuery,
  onSearchQueryChange,
  activeFastFilterIds,
  onToggleFastFilter,
  onClearAll,
  onOpenFilterDrawer,
  children,
}: ShopToolbarProps) {
  const activeFilters = FAST_FILTERS.filter((filter) => activeFastFilterIds.includes(filter.id));

  return (
    <div className="col-xl-9 col-lg-8 col-md-12 col-sm-12 col-12 mt--24 mt_sm--8 mt_md--8">
      <div className="row row--12">
        <div className="col-md-12">
          <div className="rbt-shop-tools-wrapper">
            <div className="rbt-shop-tool-content rbt-shop-filter-tag-wrapper w-100">
              <p className="rbt-shop-tools-title h6">
                Fast FIlter :
              </p>
              <div className="rbt-shop-filter-tag-list rbt-tag-list rbt-tag-list-rounded rbt-tag-list-var-one">
                {FAST_FILTERS.map((filter) => (
                  <a
                    href="#"
                    key={filter.id}
                    className={activeFastFilterIds.includes(filter.id) ? "active" : ""}
                    onClick={(event) => {
                      event.preventDefault();
                      onToggleFastFilter(filter.id);
                    }}
                  >
                    <i className={filter.iconClass} />
                    {filter.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="rbt-shop-tools-wrapper rbt-shop-tools-wrapper-var-one mt--20 mt_sm--12">
            <div className="rbt-shop-tool-content rbt-shop-view-var-wrapper sm_w-100 md_w-100">
              <p className="rbt-shop-tools-title h6">
                {total === 0 ? "No products found" : `Showing ${pageStart}–${pageEnd} of ${total} results`}
              </p>
              <div className="rbt-shop-view-btn-list rbt-tag-list-rounded rbt-shop-view-menu d-none d-lg-flex">
                <a href="#" className="tooltips" data-tooltip="List Style" data-tooltip-position="top">
                  <i className="fa-regular fa-list" />
                </a>
                <a href="#" className="tooltips" data-tooltip="Two Column" data-tooltip-position="top">
                  <i className="fa-regular fa-grid-2" />
                </a>
                <a className="active tooltips" href="#" data-tooltip="Three Column" data-tooltip-position="top">
                  <i className="fa-sharp fa-light fa-grid" />
                </a>
                <a href="#" className="tooltips" data-tooltip="Four Column" data-tooltip-position="top">
                  <i className="fa-sharp fa-light fa-grid-4" />
                </a>
              </div>
              <div className="rbt-shop-tools-title h3 rbt--text-color-heading d-flex w-100 justify-content-end d-lg-none">
                <div className="rbt-modern-select rbt-shop-view-sort-select-one rbt-shop-sort-icon-only">
                  <select
                    className="rbt-select-activation rbt-select-icon-only"
                    aria-label="Sort products"
                    value={sort}
                    onChange={(event) => onSortChange(event.target.value as SortOption)}
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="rbt-shop-tool-content rbt-shop-view-sort-wrapper d-none d-lg-flex">
              <div className="rbt-tools-select-single">
                <p className="rbt-shop-tools-title h6">
                  Sort :
                </p>
                <div className="rbt-modern-select rbt-shop-view-sort-select-one">
                  <select
                    className="rbt-select-activation"
                    value={sort}
                    onChange={(event) => onSortChange(event.target.value as SortOption)}
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="rbt-tools-select-single d-none d-lg-flex">
                <p className="rbt-shop-tools-title h6">
                  Show :
                </p>
                <div className="rbt-modern-select rbt-shop-view-sort-select-two">
                  <select
                    className="rbt-select-activation"
                    value={pageSize}
                    onChange={(event) => onPageSizeChange(Number(event.target.value))}
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size} Items
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="rbt-shop-tool-content rbt-shop-view-var-wrapper d-none d-lg-flex">
              <form
                className="rbt-inner-search-field style-one rbt-search-field-rounded"
                onSubmit={(event) => event.preventDefault()}
              >
                <input
                  type="text"
                  placeholder="Search for products"
                  value={searchQuery}
                  onChange={(event) => onSearchQueryChange(event.target.value)}
                />
                <button className="rbt-round-btn search-btn" type="submit" aria-label="Search">
                  <i className="fa-solid fa-magnifying-glass" />
                </button>
              </form>
            </div>
          </div>
          {activeFilters.length > 0 && (
            <div className="rbt-shop-tools-wrapper mt--20 d-none d-lg-block">
              <div className="rbt-shop-tool-content rbt-shop-filter-tag-wrapper">
                <div className="rbt-shop-filter-tag-list rbt-tag-list rbt-tag-list-sm rbt-tag-list-bg-var-one rbt-tag-list-rounded rbt-tag-cancel-var">
                  {activeFilters.map((filter) => (
                    <a
                      href="#"
                      key={filter.id}
                      onClick={(event) => {
                        event.preventDefault();
                        onToggleFastFilter(filter.id);
                      }}
                    >
                      <i className="fa-solid fa-xmark" />
                      {filter.label}
                    </a>
                  ))}
                  <a
                    href="#"
                    className="text-decoration-underline"
                    onClick={(event) => {
                      event.preventDefault();
                      onClearAll();
                    }}
                  >
                    Clear All
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="rbt-shop-tool-content rbt-shop-view-var-wrapper justify-content-between d-lg-none mt--16 mt_sm--12">
        <p className="rbt-shop-tools-title h6 rbt-text-color-heading">
          <a
            href="#"
            className="rbt-filter-offcanvas-activation rbt-filter-button"
            onClick={(event) => {
              event.preventDefault();
              onOpenFilterDrawer();
            }}
          >
            <i className="fa-sharp fa-regular fa-filter mr--4" />
            <span className="filter-text">
              Show Filter
            </span>
          </a>
        </p>
      </div>
      {children}
    </div>
  );
}
