"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { saveNotificationPreferences } from "@/lib/actions/notifications";
import { t } from "@/lib/i18n";
import { DEFAULT_NOTIFICATION_PREFERENCES, getNotificationPreferences, type NotificationPreferences } from "@/lib/notifications";

interface NotificationPref {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
}

const PREFS: NotificationPref[] = [
  { key: "orderUpdates", label: "Order updates", description: "Shipping, delivery, and status changes for your orders." },
  { key: "promotions", label: "Promotions and offers", description: "Sales, discount codes, and seasonal deals." },
  { key: "newsletter", label: "Newsletter", description: "New arrivals and product recommendations." },
  { key: "smsAlerts", label: "SMS alerts", description: "Text messages for time-sensitive order updates." },
];

// NotificationSettings — /account/notifications. Reads/writes via lib/notifications.ts's
// getNotificationPreferences and lib/actions/notifications.ts's saveNotificationPreferences,
// backed by the notification_preferences table (supabase/migrations/
// 0015_notification_preferences.sql) — one row per user, upserted on save. Ported to match the
// rest of /account (profile.tsx's rbt-single-info list) using Bootstrap's own form-switch
// (bootstrap.min.css, already imported in app/(site)/layout.tsx — same form-check family
// address-book.tsx already uses for its "set as default" checkbox).
export function NotificationSettings() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [isPrefsLoading, setIsPrefsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let active = true;
    getNotificationPreferences(user.id).then((result) => {
      if (active) {
        setPrefs(result);
        setIsPrefsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [user]);

  function toggle(key: keyof NotificationPreferences) {
    setPrefs((current) => ({ ...current, [key]: !current[key] }));
    setSavedAt(null);
  }

  async function handleSave() {
    setIsSaving(true);
    setError("");
    const result = await saveNotificationPreferences(prefs);
    if (result.success) {
      setSavedAt(Date.now());
    } else {
      setError(result.error);
    }
    setIsSaving(false);
  }

  if (isAuthLoading || !user) {
    return (
      <div className="rbt-profile-content-area">
        <p className="b1 mb--0">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="rbt-profile-content-area">
      <div className="row row--12 mt_dec--24">
        <div className="col-12 mt--24">
          <div className="rbt-component-section-title rbt-gap--4 mb--0 p-0 border-0">
            <h2 className="rbt-title mb--0">
              <span className="rbt-text-bold">
                Notifications
              </span>
            </h2>
          </div>
        </div>
      </div>
      <hr className="mt--20 mb--16" />

      {isPrefsLoading && (
        <p className="b1 mb--0">{t("common.loading")}</p>
      )}

      {!isPrefsLoading && (
        <div className="rbt-scrollable-content hide-scrollbar">
          {PREFS.map((pref, index) => (
            <div key={pref.key}>
              {index > 0 && <hr />}
              <div className="rbt-single-info mb--24">
                <div className="rbt-single-info-header d-flex justify-content-between align-items-center mb--0 pt--4">
                  <div>
                    <h2 className="h6 mb--4">
                      {pref.label}
                    </h2>
                    <p className="b1 mb--0">
                      {pref.description}
                    </p>
                  </div>
                  <div className="form-check form-switch mb--0">
                    <input
                      type="checkbox"
                      role="switch"
                      className="form-check-input"
                      id={`notif-${pref.key}`}
                      checked={prefs[pref.key]}
                      onChange={() => toggle(pref.key)}
                      aria-label={pref.label}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="rbt-text-color-danger mb--16">
          {error}
        </p>
      )}

      <div className="d-flex align-items-center rbt-gap--12 mt--8">
        <button type="button" className="rbt-btn rbt-btn-sm" onClick={handleSave} disabled={isSaving || isPrefsLoading}>
          Save Preferences
        </button>
        {savedAt && (
          <p className="b1 mb--0">
            Preferences saved.
          </p>
        )}
      </div>
    </div>
  );
}
