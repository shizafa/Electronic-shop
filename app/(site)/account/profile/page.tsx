import type { Metadata } from "next";
import { Profile } from "@/components/profile/profile";
import { t } from "@/lib/i18n";

// See ../orders/page.tsx for why account routes are forced dynamic.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: t("account.profile"),
};

// /account/profile route: renders the account "Personal Information" panel
export default function AccountProfilePage() {
  return <Profile />;
}