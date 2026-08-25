"use client";

import { useState, type SubmitEvent } from "react";
import { toast } from "sonner";
import { submitContactMessage } from "@/lib/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/lib/i18n";

// ContactForm — submits to contact_messages via a Server Action; admins review submissions
// in the /admin/messages inbox.
export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await submitContactMessage({ name, email, subject, message });

    setIsSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setIsSubmitted(true);
  }

  if (isSubmitted) {
    return (
      <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-foreground">
        {t("contact.submitted")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-name" className="text-sm font-medium text-foreground">
          {t("auth.name")}
        </label>
        <Input id="contact-name" required value={name} onChange={(event) => setName(event.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-email" className="text-sm font-medium text-foreground">
          {t("auth.email")}
        </label>
        <Input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-subject" className="text-sm font-medium text-foreground">
          {t("contact.subject")}
        </label>
        <Input
          id="contact-subject"
          required
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className="text-sm font-medium text-foreground">
          {t("contact.message")}
        </label>
        <Textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </div>

      <Button type="submit" size="lg" className="self-start" disabled={isSubmitting}>
        {t("contact.send")}
      </Button>
    </form>
  );
}