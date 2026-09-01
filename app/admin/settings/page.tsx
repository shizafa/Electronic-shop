import { StoreSettingsForm } from "@/components/admin/settings/store-settings-form";
import { StoreContactForm } from "@/components/admin/settings/store-contact-form";
import { StoreCommerceForm } from "@/components/admin/settings/store-commerce-form";
import { StorePoliciesForm } from "@/components/admin/settings/store-policies-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSettings } from "@/lib/settings";
import { t } from "@/lib/i18n";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <Tabs defaultValue="store">
      <TabsList>
        <TabsTrigger value="store">{t("admin.settings.store")}</TabsTrigger>
        <TabsTrigger value="contact">{t("admin.settings.contact")}</TabsTrigger>
        <TabsTrigger value="commerce">{t("admin.settings.commerce")}</TabsTrigger>
        <TabsTrigger value="policies">{t("admin.settings.policies")}</TabsTrigger>
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
    </Tabs>
  );
}
