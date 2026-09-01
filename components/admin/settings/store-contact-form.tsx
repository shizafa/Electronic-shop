"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { updateContact } from "@/lib/actions/admin/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/lib/i18n";
import type { StoreSettings } from "@/lib/settings";

export function StoreContactForm({ initialSettings }: { initialSettings: StoreSettings }) {
  const [email, setEmail] = useState(initialSettings.email ?? "");
  const [phone, setPhone] = useState(initialSettings.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(initialSettings.whatsapp ?? "");
  const [address, setAddress] = useState(initialSettings.address ?? "");
  const [facebookUrl, setFacebookUrl] = useState(initialSettings.facebookUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState(initialSettings.instagramUrl ?? "");
  const [twitterUrl, setTwitterUrl] = useState(initialSettings.twitterUrl ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(initialSettings.youtubeUrl ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await updateContact({
      email: email || undefined,
      phone: phone || undefined,
      whatsapp: whatsapp || undefined,
      address: address || undefined,
      facebookUrl: facebookUrl || undefined,
      instagramUrl: instagramUrl || undefined,
      twitterUrl: twitterUrl || undefined,
      youtubeUrl: youtubeUrl || undefined,
    });

    setIsSubmitting(false);
    if (result.success) {
      toast.success(t("admin.settings.contactSaved"));
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-email">{t("admin.settings.email")}</Label>
        <Input id="contact-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-phone">{t("admin.settings.phone")}</Label>
          <Input id="contact-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-whatsapp">{t("admin.settings.whatsapp")}</Label>
          <Input id="contact-whatsapp" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-address">{t("admin.settings.address")}</Label>
        <Textarea
          id="contact-address"
          rows={2}
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-facebook">{t("admin.settings.facebookUrl")}</Label>
          <Input
            id="contact-facebook"
            value={facebookUrl}
            onChange={(event) => setFacebookUrl(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-instagram">{t("admin.settings.instagramUrl")}</Label>
          <Input
            id="contact-instagram"
            value={instagramUrl}
            onChange={(event) => setInstagramUrl(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-twitter">{t("admin.settings.twitterUrl")}</Label>
          <Input id="contact-twitter" value={twitterUrl} onChange={(event) => setTwitterUrl(event.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-youtube">{t("admin.settings.youtubeUrl")}</Label>
          <Input id="contact-youtube" value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {t("admin.settings.saveContact")}
      </Button>
    </form>
  );
}
