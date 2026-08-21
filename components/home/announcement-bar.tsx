"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { t } from "@/lib/i18n";

const messages = ["home.trust.freeDelivery", "checkout.codAvailable", "checkout.installationService"];

// Thin dismissible strip at the very top of every page with quick perks
export function AnnouncementBar() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="relative bg-foreground text-background">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-2 text-center text-xs font-medium">
        {messages.map((key) => (
          <span key={key}>{t(key)}</span>
        ))}
      </div>
      <button
        type="button"
        aria-label={t("common.dismiss")}
        onClick={() => setIsDismissed(true)}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-background/70 hover:text-background"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
