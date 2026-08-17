"use client";

import { t } from "@/lib/i18n";
import type { InstallationSchedule } from "@/types/order";

const TIME_SLOTS = ["9:00 AM - 12:00 PM", "12:00 PM - 3:00 PM", "3:00 PM - 6:00 PM"];

function getUpcomingDates(count: number): { value: string; label: string }[] {
  const dates: { value: string; label: string }[] = [];
  for (let i = 1; i <= count; i += 1) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push({
      value: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    });
  }
  return dates;
}

interface InstallationSchedulerProps {
  value: InstallationSchedule | undefined;
  onChange: (value: InstallationSchedule) => void;
}

export function InstallationScheduler({ value, onChange }: InstallationSchedulerProps) {
  const dates = getUpcomingDates(7);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">{t("checkout.installationDate")}</p>
        <div className="flex flex-wrap gap-2">
          {dates.map((date) => (
            <button
              key={date.value}
              type="button"
              onClick={() => onChange({ date: date.value, timeSlot: value?.timeSlot ?? TIME_SLOTS[0] })}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                value?.date === date.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary"
              }`}
            >
              {date.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">{t("checkout.installationTimeSlot")}</p>
        <div className="flex flex-wrap gap-2">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              disabled={!value?.date}
              onClick={() => onChange({ date: value?.date ?? dates[0].value, timeSlot: slot })}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                value?.timeSlot === slot
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}