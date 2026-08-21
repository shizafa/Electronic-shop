"use server";

import { requireAdmin } from "@/lib/actions/admin/guard";

export interface UpdateSalesTargetsInput {
  weeklyTarget: number;
  monthlyTarget: number;
}

export type SettingsActionResult = { success: true } | { success: false; error: string };

export async function updateSalesTargets(input: UpdateSalesTargetsInput): Promise<SettingsActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  if (input.weeklyTarget < 0 || input.monthlyTarget < 0) {
    return { success: false, error: "Targets can't be negative" };
  }

  const { error } = await guard.supabase
    .from("sales_targets")
    .update({
      weekly_target: input.weeklyTarget,
      monthly_target: input.monthlyTarget,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) return { success: false, error: "Failed to save targets" };
  return { success: true };
}
