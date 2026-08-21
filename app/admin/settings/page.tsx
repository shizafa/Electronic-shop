import { SalesTargetsForm } from "@/components/admin/settings/sales-targets-form";
import { getSalesTargets } from "@/lib/admin/settings";

export default async function AdminSettingsPage() {
  const targets = await getSalesTargets();
  return <SalesTargetsForm initialTargets={targets} />;
}
