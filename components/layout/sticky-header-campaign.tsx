"use client";

import { useState } from "react";
import { StickyHeaderTicker } from "@/components/layout/sticky-header-ticker";

// The campaign strip above the sticky nav (rbt-header-campaign) plus its close button.
// Needs its own client component (rather than living inline in sticky-header.tsx, a Server
// Component) purely to hold the dismissed/not-dismissed state.
export function StickyHeaderCampaign() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="rbt-header-campaign rbt-header-campaign-1 rbt-header-top-news rbt-topbar-bg-img rbt-topbar-bg-one w-100">
      <div className="rbt-corner-portion-wrapper">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="inner justify-content-center">
                <StickyHeaderTicker />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="icon-close position-right">
        <button
          className="rbt-round-btn btn-white-off bgsection-activation"
          aria-label="Close Button"
          type="button"
          onClick={() => setDismissed(true)}
        >
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
    </div>
  );
}
