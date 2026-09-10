import type { Metadata } from "next";
import { NotificationSettings } from "@/components/account/notification-settings";

// See ../orders/page.tsx for why account routes are forced dynamic.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notifications",
};

// /account/notifications route: renders notification preference toggles (see
// components/account/notification-settings.tsx for its data flow).
export default function AccountNotificationsPage() {
  return <NotificationSettings />;
}
