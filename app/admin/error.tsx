"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

// Admin error boundary: catches data-fetch failures thrown by /admin pages (e.g. the
// getProductById / getCategoryById lookups on the edit pages) instead of treating them as a 404.
export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex max-w-3xl flex-col items-start gap-3">
      <p className="text-sm text-muted-foreground">{t("common.loadFailed")}</p>
      <Button variant="outline" onClick={() => retry()}>
        {t("common.tryAgain")}
      </Button>
    </div>
  );
}
