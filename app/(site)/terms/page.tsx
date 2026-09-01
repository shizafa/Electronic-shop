import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { renderMarkdown } from "@/lib/markdown";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("footer.termsOfService"),
};

// /terms route: renders the admin-authored terms Markdown. 404s when the field is empty
// rather than showing a blank page.
export default async function TermsPage() {
  const settings = await getSettings();
  if (!settings.terms) notFound();

  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {t("footer.termsOfService")}
      </h1>
      <div
        className="mt-6 text-foreground [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:mt-4 [&_h4]:font-semibold [&_p]:mt-4 [&_p]:leading-relaxed [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(settings.terms) }}
      />
    </div>
  );
}
