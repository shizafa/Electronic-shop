"use client";

import { type ReactNode, useState } from "react";

// TODO: wire to backend
const PLACEHOLDER = {
  showMore: "Show More",
  showLess: "Show Less",
};

// Replaces the template's JS show-more plugin: toggles `active` on both the details area
// (which unclamps max-height) and the button area (which drops the fade overlay and flips
// the chevron via ::after). All of that styling already exists in style.min.css.
//
// The spec and shipment lists arrive as `children`, so they stay server-rendered and the
// expand/collapse state re-renders only this wrapper — not the lists themselves.
export function ProductCardDetails({ children }: { children: ReactNode }) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  return (
    <div className={`prd-details-area rbt-has-show-more${detailsExpanded ? " active" : ""}`}>
      {children}
      <div className={`rbt-show-more-btn-area${detailsExpanded ? " active" : ""}`}>
        <button className="rbt-show-more-btn" type="button" onClick={() => setDetailsExpanded((expanded) => !expanded)} aria-expanded={detailsExpanded}>
          {detailsExpanded ? PLACEHOLDER.showLess : PLACEHOLDER.showMore}
        </button>
      </div>
    </div>
  );
}
