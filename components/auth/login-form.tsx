"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { t } from "@/lib/i18n";

// LoginForm — authenticates an existing user and redirects back to where they came from
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const success = await login(email, password);
    if (!success) {
      setError(t("auth.invalidCredentials"));
      setIsSubmitting(false);
      return;
    }

    // send the user to the page they were trying to reach before logging in, if any
    router.push(searchParams.get("redirect") || "/");
  }

  return (
    <div className="container-page flex justify-center py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold">{t("auth.loginHeading")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("auth.loginSubheading")}</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
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

          <Button type="submit" size="lg" className="mt-2" disabled={isSubmitting}>
            {t("nav.login")}
          </Button>
        </form>

        <p className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          {t("auth.demoAccountsHint")}
        </p>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("auth.noAccount")}{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            {t("nav.signup")}
          </Link>
        </p>
      </div>
    </div>
  );
}