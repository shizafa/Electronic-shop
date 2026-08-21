"use client";

import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";

// TODO: no subscriber list/table exists yet — this form is UI-only for now, matching the
// same pattern as the product page's Reviews/Q&A forms. Wire up once that backend exists.
export function NewsletterBar() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setEmail("");
  }

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container-page flex flex-wrap items-center justify-between gap-4 py-4">
        <div>
          <p className="text-lg font-semibold">{t("footer.newsletterHeading")}</p>
          <p className="text-sm text-primary-foreground/80">{t("footer.newsletterSubheading")}</p>
        </div>

        {submitted ? (
          <p className="text-sm font-medium">{t("footer.newsletterComingSoon")}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full max-w-md items-center gap-2 sm:w-auto">
            <div className="relative flex-1">
              <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("footer.emailPlaceholder")}
                className="bg-background pl-9 text-foreground"
              />
            </div>
            <Button type="submit" variant="secondary" className="rounded-full">
              {t("footer.subscribe")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
