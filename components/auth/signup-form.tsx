"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { t } from "@/lib/i18n";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const success = signup(name, email, phone, password);
    if (!success) {
      setError(t("auth.emailTaken"));
      return;
    }

    router.push(searchParams.get("redirect") || "/");
  }

  return (
    <div className="container-page flex justify-center py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold">{t("auth.signupHeading")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("auth.signupSubheading")}</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              {t("auth.name")}
            </label>
            <Input id="name" required value={name} onChange={(event) => setName(event.target.value)} />
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
              onChange={(event) => setEmail(event.target.value)}
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
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              {t("auth.password")}
            </label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" size="lg" className="mt-2">
            {t("nav.signup")}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("auth.haveAccount")}{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t("nav.login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
