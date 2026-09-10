"use server";

import { createClient } from "@/lib/supabase/server";
import type { NotificationPreferences } from "@/lib/notifications";

export type SaveNotificationPreferencesResult = { success: true } | { success: false; error: string };

// Upserts the caller's own row (notification_preferences_all_own RLS: auth.uid() = user_id) —
// upsert rather than update because a user's first save has no existing row yet (see
// lib/notifications.ts's getNotificationPreferences on the no-row/defaults case).
export async function saveNotificationPreferences(
  input: NotificationPreferences
): Promise<SaveNotificationPreferencesResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You need to be signed in to save preferences" };

  const { error } = await supabase.from("notification_preferences").upsert({
    user_id: user.id,
    order_updates: input.orderUpdates,
    promotions: input.promotions,
    newsletter: input.newsletter,
    sms_alerts: input.smsAlerts,
    updated_at: new Date().toISOString(),
  });

  if (error) return { success: false, error: "Failed to save preferences" };
  return { success: true };
}
