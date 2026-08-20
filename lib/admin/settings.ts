import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface SalesTargets {
  weeklyTarget: number;
  monthlyTarget: number;
}

export async function getSalesTargets(): Promise<SalesTargets> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales_targets")
    .select("weekly_target, monthly_target")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("getSalesTargets failed", error);
    return { weeklyTarget: 0, monthlyTarget: 0 };
  }
  return { weeklyTarget: Number(data.weekly_target), monthlyTarget: Number(data.monthly_target) };
}
