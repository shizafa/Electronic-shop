"use client";

import Link from "next/link";
import { useState } from "react";

// Rebuilds the template's Bootstrap alert-dismiss (data-bs-dismiss="alert") with React state
// instead of Bootstrap JS. Copy rewritten for an electronics store — the pasted markup's
// original text ("buy Grocery's at wholesale prices for your shop") is leftover copy from a
// grocery-store version of this template.
export function ProductRegisterBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="rbt-quick-access-banner rbt-quick-access-banner-sm rbt-bg-color-brand-300 rbt-rounded--8" role="alert">
      <div className="rbt-quick-access-banner-banner-content d-flex align-items-center">
        <div className="rbt-icon-img">
          <img src="/assets/images/icons/product-single/gift-box-01-sm.svg" alt="" />
        </div>
        <p className="rbt-quick-access-banner-title b3 mb-0">
          Create an account to track your orders and get early access to deals.
        </p>
      </div>
      <div className="rbt-quick-access-banner-action-btn">
        <Link className="rbt-btn rbt-btn-xs" href="/signup">
          <i className="fa-light fa-user mr--4" />
          Register Now
        </Link>
      </div>
      <button type="button" className="rbt-cancel-btn" onClick={() => setDismissed(true)} aria-label="Close">
        <i className="fa-solid fa-xmark" />
      </button>
    </div>
  );
}
