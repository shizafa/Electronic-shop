import { StoreSettingsForm } from "@/components/admin/settings/store-settings-form";
import { StoreContactForm } from "@/components/admin/settings/store-contact-form";
import { StoreCommerceForm } from "@/components/admin/settings/store-commerce-form";
import { StorePoliciesForm } from "@/components/admin/settings/store-policies-form";
import { WhyShopFeaturesForm } from "@/components/admin/settings/why-shop-features-form";
import { SalesTargetsForm } from "@/components/admin/settings/sales-targets-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRevenueForPeriod } from "@/lib/admin/dashboard";
import { getSalesTargets } from "@/lib/admin/settings";
import { getSettings } from "@/lib/settings";
import { t } from "@/lib/i18n";

// Filled primary pill for the selected tab — the shared TabsTrigger's default active state
// (bg-background on bg-muted) is too low-contrast here. Overridden per-page rather than in
// the shared components/ui/tabs.tsx.
const TRIGGER_CLASS =
  "px-3 data-active:bg-primary data-active:text-primary-foreground data-active:hover:text-primary-foreground dark:data-active:border-transparent dark:data-active:bg-primary dark:data-active:text-primary-foreground";

export default async function AdminSettingsPage() {
  const [settings, salesTargets, weekRevenue, monthRevenue] = await Promise.all([
    getSettings(),
    getSalesTargets(),
    getRevenueForPeriod("week"),
    getRevenueForPeriod("month"),
  ]);

  return (
    <Tabs defaultValue="store">
      <TabsList>
        <TabsTrigger value="store" className={TRIGGER_CLASS}>{t("admin.settings.store")}</TabsTrigger>
        <TabsTrigger value="contact" className={TRIGGER_CLASS}>{t("admin.settings.contact")}</TabsTrigger>
        <TabsTrigger value="commerce" className={TRIGGER_CLASS}>{t("admin.settings.commerce")}</TabsTrigger>
        <TabsTrigger value="policies" className={TRIGGER_CLASS}>{t("admin.settings.policies")}</TabsTrigger>
        <TabsTrigger value="why-shop" className={TRIGGER_CLASS}>{t("admin.settings.whyShopFeatures")}</TabsTrigger>
        <TabsTrigger value="targets" className={TRIGGER_CLASS}>{t("admin.settings.salesTargets")}</TabsTrigger>
      </TabsList>

      <TabsContent value="store">
        <StoreSettingsForm initialSettings={settings} />
      </TabsContent>

      <TabsContent value="contact">
        <StoreContactForm initialSettings={settings} />
      </TabsContent>

      <TabsContent value="commerce">
        <StoreCommerceForm initialSettings={settings} />
      </TabsContent>

      <TabsContent value="policies">
        <StorePoliciesForm initialSettings={settings} />
      </TabsContent>

      <TabsContent value="why-shop">
        <WhyShopFeaturesForm initialSettings={settings} />
      </TabsContent>

      <TabsContent value="targets">
        <SalesTargetsForm
          initialTargets={salesTargets}
          weekRevenue={weekRevenue}
          monthRevenue={monthRevenue}
        />
      </TabsContent>
    </Tabs>
  );
}
