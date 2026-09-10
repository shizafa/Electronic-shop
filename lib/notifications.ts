import { createClient } from "@/lib/supabase/client";

export interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
  smsAlerts: boolean;
}

interface NotificationPreferencesRow {
  order_updates: boolean;
  promotions: boolean;
  newsletter: boolean;
  sms_alerts: boolean;
}

// Matches notification_preferences' own column defaults (supabase/migrations/
// 0015_notification_preferences.sql) — what a user with no saved row yet sees.
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  orderUpdates: true,
  promotions: true,
  newsletter: false,
  smsAlerts: true,
};

function mapRow(row: NotificationPreferencesRow): NotificationPreferences {
  return {
    orderUpdates: row.order_updates,
    promotions: row.promotions,
    newsletter: row.newsletter,
    smsAlerts: row.sms_alerts,
  };
}

// A signed-in user's saved notification preferences, or the column defaults if they've never
// saved any (no row yet — maybeSingle rather than single, since that's expected, not an error).
// Uses the browser client (notification_preferences_all_own RLS), same pattern as
// lib/orders.ts's getOrdersForUser.
export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("order_updates, promotions, newsletter, sms_alerts")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("getNotificationPreferences failed", error);
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
  return data ? mapRow(data as unknown as NotificationPreferencesRow) : DEFAULT_NOTIFICATION_PREFERENCES;
}
