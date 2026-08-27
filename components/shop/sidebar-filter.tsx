"use client";

import { useRef, useState } from "react";
import { formatPrice } from "@/lib/currency";

interface BrandOption {
  name: string;
  count: number;
}

// One collapsible checkbox-list widget (title + options), reused for /shop's Categories
// widget and /category/[slug]'s per-spec-field widgets (Tonnage, Energy Rating, ...) —
// same rbt-widget-categories markup either way, just different data/labels.
export interface ChecklistOption {
  id: string;
  label: string;
  count: number;
}

export interface ChecklistWidgetData {
  id: string;
  title: string;
  options: ChecklistOption[];
  activeIds: string[];
  onToggle: (optionId: string) => void;
}

// Price tiers for the "Filter by price" quick-select checkboxes — undefined min/max means
// "no lower/upper bound" (the first tier is "Under X", the last is "X & Above"). Exported so
// ShopListing can compute a real product count per tier from the same boundaries.
export interface PriceBucket {
  min?: number;
  max?: number;
}

export const PRICE_BUCKETS: PriceBucket[] = [
  { max: 25000 },
  { min: 25000, max: 50000 },
  { min: 50000, max: 100000 },
  { min: 100000, max: 200000 },
  { min: 200000 },
];

function bucketLabel(bucket: PriceBucket): string {
  if (bucket.min === undefined) return `Under ${formatPrice(bucket.max!)}`;
  if (bucket.max === undefined) return `${formatPrice(bucket.min)} & Above`;
  return `${formatPrice(bucket.min)} to ${formatPrice(bucket.max)}`;
}

interface SidebarFilterProps {
  checklistWidgets: ChecklistWidgetData[];
  brands: BrandOption[];
  activeBrand: string | null;
  onSelectBrand: (brand: string) => void;
  priceBounds: { min: number; max: number };
  priceBucketCounts: number[];
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}

interface PriceRangeSliderProps {
  bounds: { min: number; max: number };
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}

// Rebuilds the template's jQuery-UI-slider-driven `#rbt-slider-range` widget with plain
// pointer events + React state per CLAUDE.md (no jQuery plugins in this project). Renders the
// same `.ui-slider-range`/`.ui-slider-handle` structure style.min.css already styles (that CSS
// assumes jQuery UI generates these elements — here they're plain spans we position by hand).
function PriceRangeSlider({ bounds, minPrice, maxPrice, onMinPriceChange, onMaxPriceChange }: PriceRangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const span = Math.max(1, bounds.max - bounds.min);

  const currentMin = minPrice ? Number(minPrice) : bounds.min;
  const currentMax = maxPrice ? Number(maxPrice) : bounds.max;
  const minPercent = ((currentMin - bounds.min) / span) * 100;
  const maxPercent = ((currentMax - bounds.min) / span) * 100;

  function priceFromClientX(clientX: number): number {
    const track = trackRef.current;
    if (!track) return bounds.min;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.round(bounds.min + ratio * span);
  }

  function startDrag(handle: "min" | "max") {
    return (event: React.PointerEvent<HTMLSpanElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);

      function onMove(moveEvent: PointerEvent) {
        const price = priceFromClientX(moveEvent.clientX);
        if (handle === "min") {
          onMinPriceChange(String(Math.min(price, currentMax)));
        } else {
          onMaxPriceChange(String(Math.max(price, currentMin)));
        }
      }
      function onUp() {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      }
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    };
  }

  return (
    <div className="rbt-price-range-slider">
      <div id="rbt-slider-range" className="rbt-range-bar" ref={trackRef}>
        <div className="ui-slider-range" style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }} />
        <span
          className="ui-slider-handle"
          style={{ left: `${minPercent}%`, marginLeft: "-8px" }}
          onPointerDown={startDrag("min")}
          role="slider"
          tabIndex={0}
          aria-label="Minimum price"
          aria-valuemin={bounds.min}
          aria-valuemax={bounds.max}
          aria-valuenow={currentMin}
        />
        <span
          className="ui-slider-handle"
          style={{ left: `${maxPercent}%`, marginLeft: "-8px" }}
          onPointerDown={startDrag("max")}
          role="slider"
          tabIndex={0}
          aria-label="Maximum price"
          aria-valuemin={bounds.min}
          aria-valuemax={bounds.max}
          aria-valuenow={currentMax}
        />
      </div>
      <p className="rbt-range-value">
        <input type="text" id="amount" readOnly value={`${formatPrice(currentMin)} - ${formatPrice(currentMax)}`} />
      </p>
    </div>
  );
}

interface ChecklistWidgetSectionProps {
  widget: ChecklistWidgetData;
  collapseDomId: string;
  open: boolean;
  onToggleOpen: () => void;
}

// One "rbt-widget-categories" checkbox-list widget — same markup as the pasted Categories
// widget, driven by whatever ChecklistWidgetData it's given.
function ChecklistWidgetSection({ widget, collapseDomId, open, onToggleOpen }: ChecklistWidgetSectionProps) {
  return (
    <div className="rbt-single-widget rbt-widget-categories">
      <div className="rbt-single-widget-inner">
        <h2 className="rbt-widget-title rbt-widget-title-without-border h4">
          <a
            href={`#${collapseDomId}`}
            role="button"
            aria-expanded={open}
            aria-controls={collapseDomId}
            onClick={(event) => {
              event.preventDefault();
              onToggleOpen();
            }}
          >
            {widget.title}
            <span className="icon">
              <i className="fa-regular fa-chevron-down" />
            </span>
          </a>
        </h2>
        <div className={`collapse ${open ? "show" : ""}`} id={collapseDomId}>
          <ul className="rbt-sidebar-list-wrapper rbt-categories-list-check">
            {widget.options.map((option) => (
              <li className="rbt-check-group" key={option.id}>
                <input
                  id={`${widget.id}-${option.id}`}
                  type="checkbox"
                  name={`${widget.id}-${option.id}`}
                  checked={widget.activeIds.includes(option.id)}
                  onChange={() => widget.onToggle(option.id)}
                />
                <label htmlFor={`${widget.id}-${option.id}`}>
                  {option.label}
                  <span className="rbt-lable count">
                    ({option.count})
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Desktop sidebar: the checklist widgets (Categories on /shop, per-spec-field widgets on
// /category/[slug]) + brand + price filters (both the Min/Max inputs and the preset
// price-tier checkboxes) are wired to real data/state from the caller. Customer Reviews and
// Filter by color have no backing data model (no rating/color fields on Product) — same
// UI-only treatment as shop-toolbar.tsx's fast-filter chips.
// The Bootstrap `data-bs-toggle="collapse"` accordion is rebuilt with useState per
// CLAUDE.md (no Bootstrap JS in this project) — collapse/show now come from openSections.
export function SidebarFilter({
  checklistWidgets,
  brands,
  activeBrand,
  onSelectBrand,
  priceBounds,
  priceBucketCounts,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}: SidebarFilterProps) {
  function isBucketActive(bucket: PriceBucket): boolean {
    const expectedMin = bucket.min !== undefined ? String(bucket.min) : "";
    const expectedMax = bucket.max !== undefined ? String(bucket.max) : "";
    return minPrice === expectedMin && maxPrice === expectedMax;
  }

  function toggleBucket(bucket: PriceBucket) {
    if (isBucketActive(bucket)) {
      onMinPriceChange("");
      onMaxPriceChange("");
      return;
    }
    onMinPriceChange(bucket.min !== undefined ? String(bucket.min) : "");
    onMaxPriceChange(bucket.max !== undefined ? String(bucket.max) : "");
  }

  // Keyed by widget.id for the dynamic checklist widgets, plus the fixed section names below.
  // Unlisted keys default to open (see isOpen) so a widget set that changes between renders
  // (different categories have different spec fields) doesn't require pre-seeding every key.
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  function isOpen(key: string): boolean {
    return openSections[key] ?? true;
  }

  function toggleSection(key: string) {
    setOpenSections((current) => ({ ...current, [key]: !isOpen(key) }));
  }

  return (
    <aside className="rbt-sidebar has-rbt-fshape d-none d-lg-block">
      <div className="rbt-sidebar-widget-wrapper rbt-sidebar-bg-one position-relative">
        <div className="rbt-sidebar-top">
          <h2 className="rbt-sidebar-title h6">
            <i className="fa-sharp fa-regular fa-filter-list mr--4" />
            Filter & Refine
            <span className="rbt-fshape-right-portion">
              <svg xmlns="http://www.w3.org/2000/svg" width="42" height="40" viewBox="0 0 52 50" fill="none">
                <path d="M51.5337 49.984C-64.8544 49.9977 116.427 49.9764 0.0390625 49.9901C0.0390625 31.262 0.0390625 20.7619 0.0390625 2.03378C11.2391 1.63419 16.5034 4.56468 19.5034 10.5602L30.0034 38.5311C34.0374 47.934 45.4209 49.4481 51.5337 49.984Z" fill="var(--color-white)" />
                <path fillRule="evenodd" clipRule="evenodd" d="M13.246 1.97519C16.582 3.50685 18.8114 5.90944 20.3979 9.07997L20.4213 9.12681L30.9315 37.1248C33.053 42.053 36.807 44.7979 40.7367 46.3047C44.6934 47.8219 48.798 48.068 51.4731 47.987C51.4731 47.987 51.51 49.2041 51.5337 49.984C48.7087 50.0695 44.3134 49.8162 40.02 48.17C35.7052 46.5155 31.4643 43.4388 29.0842 37.891L29.0751 37.8698C29.0751 37.8698 19.997 12.7279 18.5857 9.92689C17.1743 7.12591 15.2591 5.09828 12.4108 3.79055C8.49554 1.49902 0.0390625 2.03378 0.0390625 2.03378C0.0390625 20.7619 0.0390625 31.262 0.0390625 49.9901L0.0408325 0.0348727C5.70805 -0.16568 9.9493 0.461575 13.246 1.97519Z" fill="var(--color-gray-200)" />
              </svg>
            </span>
          </h2>
        </div>
        <div className="rbt-sidebar-bottom">
          {checklistWidgets.map((widget, index) => (
            <ChecklistWidgetSection
              key={widget.id}
              widget={widget}
              collapseDomId={`rbt-collapse-cw-${index}`}
              open={isOpen(widget.id)}
              onToggleOpen={() => toggleSection(widget.id)}
            />
          ))}
          {/* Start Widget Area */}
          <div className="rbt-single-widget rbt-widget-categories">
            <div className="rbt-single-widget-inner">
              <h2 className="rbt-widget-title rbt-widget-title-without-border h4">
                <a
                  href="#rbt-collapse-6"
                  role="button"
                  aria-expanded={isOpen("reviews")}
                  aria-controls="rbt-collapse-6"
                  onClick={(event) => {
                    event.preventDefault();
                    toggleSection("reviews");
                  }}
                >
                  Customer Reviews
                  <span className="icon">
                    <i className="fa-regular fa-chevron-down" />
                  </span>
                </a>
              </h2>
              <div className={`collapse ${isOpen("reviews") ? "show" : ""}`} id="rbt-collapse-6">
                <ul className="rbt-sidebar-list-wrapper rbt-categories-review-list">
                  <li className="rbt-review-group">
                    <a href="#" className="rbt-card-rating d-flex">
                      <ul className="rbt-rating-icon-list">
                        <li>
                          <i className="fa-solid fa-star rbt-rated-icon" />
                        </li>
                        <li>
                          <i className="fa-solid fa-star rbt-rated-icon" />
                        </li>
                        <li>
                          <i className="fa-solid fa-star rbt-rated-icon" />
                        </li>
                        <li>
                          <i className="fa-solid fa-star rbt-rated-icon" />
                        </li>
                        <li>
                          <i className="fa-solid fa-star" />
                        </li>
                      </ul>
                      <p className="rbt-rating-text">
                        & Up
                      </p>
                    </a>
                  </li>
                  <li className="rbt-review-group">
                    <a href="#" className="rbt-card-rating d-flex">
                      <ul className="rbt-rating-icon-list">
                        <li>
                          <i className="fa-solid fa-star rbt-rated-icon" />
                        </li>
                        <li>
                          <i className="fa-solid fa-star rbt-rated-icon" />
                        </li>
                        <li>
                          <i className="fa-solid fa-star rbt-rated-icon" />
                        </li>
                        <li>
                          <i className="fa-solid fa-star rbt-rated-icon" />
                        </li>
                        <li>
                          <i className="fa-solid fa-star" />
                        </li>
                      </ul>
                      <p className="rbt-rating-text">
                        & Up
                      </p>
                    </a>
                  </li>
                  <li className="rbt-review-group">
                    <a href="#" className="rbt-card-rating d-flex">
                      <ul className="rbt-rating-icon-list">
                        <li>
                          <i className="fa-solid fa-star rbt-rated-icon" />
                        </li>
                        <li>
                          <i className="fa-solid fa-star rbt-rated-icon" />
                        </li>
                        <li>
                          <i className="fa-solid fa-star rbt-rated-icon" />
                        </li>
                        <li>
                          <i className="fa-solid fa-star" />
                        </li>
                        <li>
                          <i className="fa-solid fa-star" />
                        </li>
                      </ul>
                      <p className="rbt-rating-text">
                        & Up
                      </p>
                    </a>
                  </li>
                  <li className="rbt-review-group">
                    <a href="#" className="rbt-card-rating d-flex">
                      <ul className="rbt-rating-icon-list">
                        <li>
                          <i className="fa-solid fa-star rbt-rated-icon" />
                        </li>
                        <li>
                          <i className="fa-solid fa-star rbt-rated-icon" />
                        </li>
                        <li>
                          <i className="fa-solid fa-star" />
                        </li>
                        <li>
                          <i className="fa-solid fa-star" />
                        </li>
                        <li>
                          <i className="fa-solid fa-star" />
                        </li>
                      </ul>
                      <p className="rbt-rating-text">
                        & Up
                      </p>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* End Widget Area */}
          {/* Start Widget Area */}
          <div className="rbt-single-widget rbt-widget-categories">
            <div className="rbt-single-widget-inner">
              <h2 className="rbt-widget-title rbt-widget-title-without-border h4">
                <a
                  href="#rbt-collapse-7"
                  role="button"
                  aria-expanded={isOpen("price")}
                  aria-controls="rbt-collapse-7"
                  onClick={(event) => {
                    event.preventDefault();
                    toggleSection("price");
                  }}
                >
                  Filter by price
                  <span className="icon">
                    <i className="fa-regular fa-chevron-down" />
                  </span>
                </a>
              </h2>
              <div className={`collapse ${isOpen("price") ? "show" : ""}`} id="rbt-collapse-7">
                <ul className="rbt-sidebar-list-wrapper rbt-categories-list-check">
                  {PRICE_BUCKETS.map((bucket, index) => (
                    <li className="rbt-check-group" key={`${bucket.min ?? ""}-${bucket.max ?? ""}`}>
                      <input
                        id={`rbt-cat-list-fil-${index + 1}`}
                        type="checkbox"
                        name={`rbt-cat-list-fil-${index + 1}`}
                        checked={isBucketActive(bucket)}
                        onChange={() => toggleBucket(bucket)}
                      />
                      <label htmlFor={`rbt-cat-list-fil-${index + 1}`}>
                        {bucketLabel(bucket)}
                        <span className="rbt-lable count">
                          ({priceBucketCounts[index] ?? 0})
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
                <PriceRangeSlider
                  bounds={priceBounds}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onMinPriceChange={onMinPriceChange}
                  onMaxPriceChange={onMaxPriceChange}
                />
                <div className="rbt-price-input-grp">
                  <input
                    type="number"
                    min="0"
                    placeholder="Rs. Min"
                    value={minPrice}
                    onChange={(event) => onMinPriceChange(event.target.value)}
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Rs. Max"
                    value={maxPrice}
                    onChange={(event) => onMaxPriceChange(event.target.value)}
                  />
                  <a href="#" className="rbt-btn">
                    Go
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* End Widget Area */}
          {/* Start Widget Area */}
          <div className="rbt-single-widget rbt-widget-categories">
            <div className="rbt-single-widget-inner">
              <h2 className="rbt-widget-title rbt-widget-title-without-border pb--0 h4">
                <a
                  href="#rbt-collapse-8"
                  role="button"
                  aria-expanded={isOpen("color")}
                  aria-controls="rbt-collapse-8"
                  onClick={(event) => {
                    event.preventDefault();
                    toggleSection("color");
                  }}
                >
                  Filter by color
                  <span className="icon">
                    <i className="fa-regular fa-chevron-down" />
                  </span>
                </a>
              </h2>
              <div className="rbt-inner-search-field border-0 pt--16 pb--16">
                <div className="rbt-search-input-section rbt-sm-search-section">
                  <input className="rbt-filter-search-field" type="text" placeholder="Search and Select Product" />
                  <span className="search-btn search-btn-dark bg-transparent rbt-text-color-gray-400">
                    <i className="fa-sharp fa-solid fa-magnifying-glass" />
                  </span>
                </div>
              </div>
              <div className={`collapse ${isOpen("color") ? "show" : ""}`} id="rbt-collapse-8">
                <div className="rbt-has-show-more">
                  <span className="rbt-filter-item-not-found rbt-text-color-danger">
                    Color not matched
                  </span>
                  <ul className="rbt-sidebar-list-wrapper rbt-categories-list-color-swatch rbt-search-filter-item-list rbt-has-show-more-inner-content">
                    <li className="rbt-color-swatch-group">
                      <a href="#" className="rbt-color-swatch-content">
                        <span className="rbt-color-swatch">
                          <span className="rbt-color-swatch-bg rbt-swatch-bg-black" />
                          <span className="rbt-color-swatch-text">
                            Black
                          </span>
                        </span>
                      </a>
                      <span className="rbt-color-swatch-count">
                        (33)
                      </span>
                    </li>
                    <li className="rbt-color-swatch-group">
                      <a href="#" className="rbt-color-swatch-content active">
                        <span className="rbt-color-swatch">
                          <span className="rbt-color-swatch-bg rbt-swatch-bg-blue" />
                          <span className="rbt-color-swatch-text">
                            Blue
                          </span>
                        </span>
                      </a>
                      <span className="rbt-color-swatch-count">
                        (56)
                      </span>
                    </li>
                    <li className="rbt-color-swatch-group">
                      <a href="#" className="rbt-color-swatch-content">
                        <span className="rbt-color-swatch">
                          <span className="rbt-color-swatch-bg rbt-swatch-bg-brown" />
                          <span className="rbt-color-swatch-text">
                            Brown
                          </span>
                        </span>
                      </a>
                      <span className="rbt-color-swatch-count">
                        (90)
                      </span>
                    </li>
                    <li className="rbt-color-swatch-group">
                      <a href="#" className="rbt-color-swatch-content">
                        <span className="rbt-color-swatch">
                          <span className="rbt-color-swatch-bg rbt-swatch-bg-gray" />
                          <span className="rbt-color-swatch-text">
                            Gray
                          </span>
                        </span>
                      </a>
                      <span className="rbt-color-swatch-count">
                        (33)
                      </span>
                    </li>
                    <li className="rbt-color-swatch-group">
                      <a href="#" className="rbt-color-swatch-content">
                        <span className="rbt-color-swatch">
                          <span className="rbt-color-swatch-bg rbt-swatch-bg-green" />
                          <span className="rbt-color-swatch-text">
                            Green
                          </span>
                        </span>
                      </a>
                      <span className="rbt-color-swatch-count">
                        (46)
                      </span>
                    </li>
                    <li className="rbt-color-swatch-group">
                      <a href="#" className="rbt-color-swatch-content">
                        <span className="rbt-color-swatch">
                          <span className="rbt-color-swatch-bg rbt-swatch-bg-orange" />
                          <span className="rbt-color-swatch-text">
                            Orange
                          </span>
                        </span>
                      </a>
                      <span className="rbt-color-swatch-count">
                        (94)
                      </span>
                    </li>
                    <li className="rbt-color-swatch-group">
                      <a href="#" className="rbt-color-swatch-content">
                        <span className="rbt-color-swatch">
                          <span className="rbt-color-swatch-bg rbt-swatch-bg-red" />
                          <span className="rbt-color-swatch-text">
                            Red
                          </span>
                        </span>
                      </a>
                      <span className="rbt-color-swatch-count">
                        (85)
                      </span>
                    </li>
                    <li className="rbt-color-swatch-group">
                      <a href="#" className="rbt-color-swatch-content">
                        <span className="rbt-color-swatch">
                          <span className="rbt-color-swatch-bg rbt-swatch-bg-yellow" />
                          <span className="rbt-color-swatch-text">
                            Yellow
                          </span>
                        </span>
                      </a>
                      <span className="rbt-color-swatch-count">
                        (55)
                      </span>
                    </li>
                    <li className="rbt-color-swatch-group">
                      <a href="#" className="rbt-color-swatch-content">
                        <span className="rbt-color-swatch">
                          <span className="rbt-color-swatch-bg rbt-swatch-bg-orange" />
                          <span className="rbt-color-swatch-text">
                            Orange
                          </span>
                        </span>
                      </a>
                      <span className="rbt-color-swatch-count">
                        (94)
                      </span>
                    </li>
                    <li className="rbt-color-swatch-group">
                      <a href="#" className="rbt-color-swatch-content">
                        <span className="rbt-color-swatch">
                          <span className="rbt-color-swatch-bg rbt-swatch-bg-red" />
                          <span className="rbt-color-swatch-text">
                            Red
                          </span>
                        </span>
                      </a>
                      <span className="rbt-color-swatch-count">
                        (85)
                      </span>
                    </li>
                    <li className="rbt-color-swatch-group">
                      <a href="#" className="rbt-color-swatch-content">
                        <span className="rbt-color-swatch">
                          <span className="rbt-color-swatch-bg rbt-swatch-bg-yellow" />
                          <span className="rbt-color-swatch-text">
                            Yellow
                          </span>
                        </span>
                      </a>
                      <span className="rbt-color-swatch-count">
                        (55)
                      </span>
                    </li>
                  </ul>
                  <div className="rbt-show-more-btn-area">
                    <button className="rbt-show-more-btn">
                      Show More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* End Widget Area */}
          {/* Start Widget Area */}
          <div className="rbt-single-widget rbt-widget-categories">
            <div className="rbt-single-widget-inner">
              <h2 className="rbt-widget-title rbt-widget-title-without-border h4">
                <a
                  href="#rbt-collapse-9"
                  role="button"
                  aria-expanded={isOpen("brand")}
                  aria-controls="rbt-collapse-9"
                  onClick={(event) => {
                    event.preventDefault();
                    toggleSection("brand");
                  }}
                >
                  Brand
                  <span className="icon">
                    <i className="fa-regular fa-chevron-down" />
                  </span>
                </a>
              </h2>
              <div className={`collapse ${isOpen("brand") ? "show" : ""}`} id="rbt-collapse-9">
                <ul className="rbt-sidebar-list-wrapper rbt-categories-list-check rbt-categories-brand-list-check">
                  {brands.map((brand) => (
                    <li className="rbt-check-group" key={brand.name}>
                      <input
                        id={`brand-${brand.name}`}
                        type="radio"
                        name="rbt-cat-list-brand-radio"
                        checked={activeBrand === brand.name}
                        onChange={() => onSelectBrand(brand.name)}
                      />
                      <label htmlFor={`brand-${brand.name}`}>
                        <span className="rbt-lable-content">
                          <span className="rbt-lable-text">
                            {brand.name}
                          </span>
                        </span>
                        <span className="rbt-lable-count">
                          ({brand.count})
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* End Widget Area */}
          {/* Start Widget Area */}
          <div className="rbt-single-widget rbt-widget-categories">
            <div className="rbt-single-widget-inner">
              <h2 className="rbt-widget-title rbt-widget-title-without-border h4">
                <a
                  href="#rbt-collapse-10"
                  role="button"
                  aria-expanded={isOpen("promotion")}
                  aria-controls="rbt-collapse-10"
                  onClick={(event) => {
                    event.preventDefault();
                    toggleSection("promotion");
                  }}
                >
                  Promotion & Services
                  <span className="icon">
                    <i className="fa-regular fa-chevron-down" />
                  </span>
                </a>
              </h2>
              <div className={`collapse ${isOpen("promotion") ? "show" : ""}`} id="rbt-collapse-10">
                <div className="rbt-sidebar-list-wrapper rbt-tag-list justify-content-start pt--0">
                  <a href="#">
                    Free Delivery
                    <i className="fa-regular fa-truck-fast" />
                  </a>
                  <a href="#">
                    Hot Deals
                    <i className="fa-sharp fa-regular fa-stars" />
                  </a>
                  <a href="#">
                    Authentic Brands
                    <i className="fa-regular fa-badge-check" />
                  </a>
                  <a href="#">
                    Cash On Delivery
                    <i className="fa-regular fa-money-bill" />
                  </a>
                  <a href="#">
                    Installment
                    <i className="fa-sharp fa-regular fa-calendar-days" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* End Widget Area */}
        </div>
      </div>
      <div className="rbt-sidebar-widget-wrapper">
        <div className="rbt-sidebar-widget-img">
          <a href="#">
            <img src="/assets/images/sidebar/sidebar-banner-one.webp" alt="Sidebar Banner" />
          </a>
        </div>
      </div>
    </aside>
  );
}
