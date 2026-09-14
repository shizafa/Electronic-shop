"use client";

import { useState, type ComponentType, type FormEvent, type SVGProps } from "react";
import { toast } from "sonner";
import { updateContact } from "@/lib/actions/admin/settings";
import { FacebookIcon, InstagramIcon, XIcon, YoutubeIcon } from "@/components/admin/settings/social-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/lib/i18n";
import type { StoreSettings } from "@/lib/settings";

interface SocialUrlFieldProps {
  id: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  value: string;
  onChange: (value: string) => void;
}

function SocialUrlField({ id, label, icon: Icon, value, onChange }: SocialUrlFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input id={id} className="ps-8" value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </div>
  );
}

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

      <div className="grid grid-cols-2 items-start gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-phone">{t("admin.settings.phone")}</Label>
          <Input
            id="contact-phone"
            type="tel"
            placeholder={t("admin.settings.phonePlaceholder")}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="contact-whatsapp">{t("admin.settings.whatsapp")}</Label>
            <Button
              type="button"
              variant="link"
              size="xs"
              className="h-auto p-0"
              disabled={!phone || whatsapp === phone}
              onClick={() => setWhatsapp(phone)}
            >
              {t("admin.settings.sameAsPhone")}
            </Button>
          </div>
          <Input
            id="contact-whatsapp"
            type="tel"
            placeholder={t("admin.settings.phonePlaceholder")}
            aria-describedby="contact-whatsapp-hint"
            value={whatsapp}
            onChange={(event) => setWhatsapp(event.target.value)}
          />
          <p id="contact-whatsapp-hint" className="text-xs text-muted-foreground">
            {t("admin.settings.whatsappHint")}
          </p>
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
        <SocialUrlField
          id="contact-facebook"
          label={t("admin.settings.facebookUrl")}
          icon={FacebookIcon}
          value={facebookUrl}
          onChange={setFacebookUrl}
        />
        <SocialUrlField
          id="contact-instagram"
          label={t("admin.settings.instagramUrl")}
          icon={InstagramIcon}
          value={instagramUrl}
          onChange={setInstagramUrl}
        />
        <SocialUrlField
          id="contact-twitter"
          label={t("admin.settings.twitterUrl")}
          icon={XIcon}
          value={twitterUrl}
          onChange={setTwitterUrl}
        />
        <SocialUrlField
          id="contact-youtube"
          label={t("admin.settings.youtubeUrl")}
          icon={YoutubeIcon}
          value={youtubeUrl}
          onChange={setYoutubeUrl}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {t("admin.settings.saveContact")}
      </Button>
    </form>
  );
}
