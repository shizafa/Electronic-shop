import type { Metadata } from "next";
import { Profile } from "@/components/profile/profile";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: t("account.profile"),
};

// /account/profile route: renders the account "Personal Information" panel
export default function AccountProfilePage() {
  return <Profile />;
}