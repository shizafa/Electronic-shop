"use client";

import { useEffect } from "react";
import { t } from "@/lib/i18n";

// Storefront error boundary: catches data-fetch failures thrown by (site) pages and their
// generateMetadata (e.g. lib/products.ts / lib/categories.ts lookups), so a DB error shows this
// instead of a 404 or an empty page. Renders inside (site)/layout.tsx, so header/footer stay up.
export default function SiteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rbt-component-area rbt-section-gap2">
      <div className="container">
        <div className="row">
          <div className="col-12 text-center">
            <p>{t("common.loadFailed")}</p>
            <button type="button" className="rbt-btn rbt-btn-sm" onClick={() => retry()}>
              {t("common.tryAgain")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
