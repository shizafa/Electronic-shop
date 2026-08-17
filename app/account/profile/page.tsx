import type { Metadata } from "next";
import { ProfileForm } from "@/components/account/profile-form";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("account.profile"),
};

// /account/profile route: renders the editable profile form
export default function AccountProfilePage() {
  return <ProfileForm />;
}