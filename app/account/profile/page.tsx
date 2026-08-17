import type { Metadata } from "next";
import { ProfileForm } from "@/components/account/profile-form";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("account.profile"),
};

export default function AccountProfilePage() {
  return <ProfileForm />;
}