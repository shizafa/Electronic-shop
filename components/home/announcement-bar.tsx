import { t } from "@/lib/i18n";

const messages = ["home.trust.freeDelivery", "checkout.codAvailable", "checkout.installationService"];

// Thin scrolling strip at the very top of the homepage with quick perks
export function AnnouncementBar() {
  return (
    <div className="bg-foreground text-background">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-2 text-center text-xs font-medium">
        {messages.map((key) => (
          <span key={key}>{t(key)}</span>
        ))}
      </div>
    </div>
  );
}
