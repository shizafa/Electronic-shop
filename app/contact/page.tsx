import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("footer.contactUs"),
};

// /contact route: static contact details plus the contact form
export default function ContactPage() {
  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("footer.contactUs")}</h1>
      <p className="mt-4 text-sm text-muted-foreground">{t("contact.intro")}</p>

      <div className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">{t("contact.phone")}</p>
              <p className="text-sm text-muted-foreground">021-111-000-000</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">{t("contact.email")}</p>
              <p className="text-sm text-muted-foreground">support@electronics.pk</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">{t("contact.address")}</p>
              <p className="text-sm text-muted-foreground">
                Suite 4B, Business Avenue, Shahrah-e-Faisal, Karachi
              </p>
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}