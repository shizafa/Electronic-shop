"use client";

import { useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { t } from "@/lib/i18n";

export function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [savedMessageVisible, setSavedMessageVisible] = useState(false);

  if (!user) return null;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    updateProfile({ name, email, phone });
    setSavedMessageVisible(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">{t("account.profile")}</h1>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          {t("auth.name")}
        </label>
        <Input
          id="name"
          required
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setSavedMessageVisible(false);
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          {t("auth.email")}
        </label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setSavedMessageVisible(false);
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="phone" className="text-sm font-medium text-foreground">
          {t("auth.phone")}
        </label>
        <Input
          id="phone"
          type="tel"
          required
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
            setSavedMessageVisible(false);
          }}
        />
      </div>

      {savedMessageVisible && <p className="text-sm text-emerald-600">{t("account.profileSaved")}</p>}

      <Button type="submit" className="self-start">
        {t("account.saveChanges")}
      </Button>
    </form>
  );
}