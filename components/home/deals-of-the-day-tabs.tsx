"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

interface DealsOfTheDayTabsProps {
  bestSellers: ReactNode;
  newArrivals: ReactNode;
  onSale: ReactNode;
  viewAllHref: string;
}

const TABS = ["Best Sellers", "New Arrivals", "On Sale"] as const;

// Rebuilds the template's jQuery-driven tab nav (RbtnavEffectActivation in main.min.js) with
// React state: clicking a tab swaps which pre-rendered product grid shows, and the
// .rbt-bg-highlight pill is measured/positioned the same way the original does — via
// getBoundingClientRect against the .rbt-nav-effect-activation ancestor, since
// .rbt-product-nav-grp itself is position:relative and would otherwise become the
// offsetParent for a naive offsetLeft/offsetTop measurement.
export function DealsOfTheDayTabs({ bestSellers, newArrivals, onSale, viewAllHref }: DealsOfTheDayTabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const navEffectRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const highlightRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const activeButton = tabRefs.current[activeTab];
    const wrapper = navEffectRef.current;
    const highlight = highlightRef.current;
    if (!activeButton || !wrapper || !highlight) return;
    const buttonRect = activeButton.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    highlight.style.width = `${buttonRect.width}px`;
    highlight.style.height = `${buttonRect.height}px`;
    highlight.style.left = `${buttonRect.left - wrapperRect.left}px`;
    highlight.style.top = `${buttonRect.top - wrapperRect.top}px`;
  }, [activeTab]);

  const tabContent = [bestSellers, newArrivals, onSale];

  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-12">
          <div className="rbt-component-section-title d-flex flex-row justify-content-between align-items-center p-0 mb--32 mb_sm--16 border-0">
            <h2 className="rbt-title rbt-scroll-trigger fade_in animation-order-1 h4">
              <span className="rbt-bold--text">
                Deals of The Day
              </span>
            </h2>
            <div className="mobile-horizontal-scroll-section">
              <div className="rbt-product-nav-section rbt-nav-effect-activation rbt-scroll-trigger fade_in animation-order-2" ref={navEffectRef}>
                <ul className="rbt-product-nav-grp">
                  {TABS.map((label, index) => (
                    <li key={label}>
                      <button
                        type="button"
                        ref={(el) => {
                          tabRefs.current[index] = el;
                        }}
                        className={`rbt-product-nav${activeTab === index ? " active" : ""}`}
                        onClick={() => setActiveTab(index)}
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
                <ul className="rbt-product-nav-grp">
                  <li>
                    <Link href={viewAllHref} className="rbt-product-nav">
                      View All
                    </Link>
                  </li>
                </ul>
                <span className="rbt-bg-highlight" ref={highlightRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Start Card Area */}
      <div className="row row--12 mt_dec--24">{tabContent[activeTab]}</div>
      {/* End Card Area */}
    </div>
  );
}
