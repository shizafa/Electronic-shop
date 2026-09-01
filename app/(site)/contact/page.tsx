import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import { getSettings } from "@/lib/settings";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("footer.contactUs"),
};

// /contact route: ContactForm renders the full template page (breadcrumb, contact-info
// cards, form, and map) — nothing else goes here.
export default async function ContactPage() {
  const settings = await getSettings();
  return <ContactForm settings={settings} />;
}