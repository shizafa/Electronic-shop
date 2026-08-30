"use client";

import { useState } from "react";
import type { InstallationSchedule } from "@/types/order";

const TIME_SLOTS = ["9:00 AM - 12:00 PM", "12:00 PM - 3:00 PM", "3:00 PM - 6:00 PM"];

type ShippingMethod = "courier" | "pickup" | "local";

// builds a list of the next `count` calendar days (starting tomorrow) as selectable installation dates
function getUpcomingDates(count: number): { value: string; weekday: string; day: string }[] {
  const dates: { value: string; weekday: string; day: string }[] = [];
  for (let i = 1; i <= count; i += 1) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push({
      value: date.toISOString().slice(0, 10),
      weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
      day: date.toLocaleDateString("en-US", { day: "numeric" }),
    });
  }
  return dates;
}

interface InstallationSchedulerProps {
  value: InstallationSchedule | undefined;
  onChange: (value: InstallationSchedule) => void;
}

// InstallationScheduler — lets the user pick a date and time slot for product installation.
// The template's "Choose shipping method" accordion (checkout-delivery-step-two.html: Courier
// delivery $16.50 / Pickup from store Free / Local shipping $23.40) has no real backing —
// shipping is always free and there's no shipping-method concept in the app — so per the user's
// choice the three methods and their prices stay as cosmetic, unwired chrome. Only the day/
// time-slot grid under Courier delivery and Pickup from store feeds the real InstallationSchedule
// state, both wired to the same value/onChange, using the real 7-upcoming-day x 3-fixed-time-slot
// data instead of the template's demo days and varying per-day times. Local shipping has no grid
// (matches the template) so selecting it alone leaves no date/time chosen.
// The accordion's open/closed panel is plain useState, replacing the template's
// data-bs-toggle="collapse" Bootstrap JS.
export function InstallationScheduler({ value, onChange }: InstallationSchedulerProps) {
  const [openMethod, setOpenMethod] = useState<ShippingMethod>("courier");
  const dates = getUpcomingDates(7); // offer the next 7 days

  function renderDateTimeGrid(idPrefix: string) {
    return (
      <div className="rbt-delivary-input-wrapper mt--12">
        {dates.map((date) => (
          <div className="rbt-single-input-box text-center" key={date.value}>
            <div className="h6 fs-sm pb-2 mb-0 rbt-text-regular">
              {date.weekday}, {date.day}
            </div>
            {TIME_SLOTS.map((slot, slotIndex) => {
              const id = `${idPrefix}-${date.value}-${slotIndex}`;
              return (
                <div className="py-1 my-1 rbt-single-order-checkbox" key={slot}>
                  <input
                    type="radio"
                    className="btn-check"
                    name={`${idPrefix}-pickup-time`}
                    id={id}
                    checked={value?.date === date.value && value?.timeSlot === slot}
                    onChange={() => onChange({ date: date.value, timeSlot: slot })}
                  />
                  <label htmlFor={id} className="rbt-btn rbt-btn-border rbt-btn-xs rbt-btn-gray-light">
                    {slot}
                  </label>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rbt-shipping-method mb-lg-4" id="shippingMethod" role="list">
      {/* Courier delivery option */}
      <div className="rbt-single-shipping-method rbt-radio-accordion border-bottom">
        <div className="form-check mb-0" role="listitem">
          <label className="form-check-label d-flex align-items-center py-3">
            <input
              type="radio"
              className="rbt-form-check-input me-2 me-sm-3"
              name="shipping-method"
              checked={openMethod === "courier"}
              onChange={() => setOpenMethod("courier")}
            />
            Courier delivery
            <span className="b1 ms-auto">
              $16.50
            </span>
          </label>
        </div>
        <div className={`collapse${openMethod === "courier" ? " show" : ""}`}>
          <div className="rbt-courier-shipping-area pb-4 ps-3 ms-2 ms-sm-3">
            <p className="fs-sm mb--0">
              Choose a courier delivery time convenient for you:
            </p>
            {renderDateTimeGrid("courier")}
          </div>
        </div>
      </div>
      {/* Pickup from store option */}
      <div className="rbt-single-shipping-method rbt-radio-accordion border-bottom">
        <div className="form-check mb-0" role="listitem">
          <label className="form-check-label d-flex align-items-center py-3">
            <input
              type="radio"
              className="rbt-form-check-input me-2 me-sm-3"
              name="shipping-method"
              checked={openMethod === "pickup"}
              onChange={() => setOpenMethod("pickup")}
            />
            Pickup from store
            <span className="fw-normal ms-auto">
              Free
            </span>
          </label>
        </div>
        <div className={`collapse${openMethod === "pickup" ? " show" : ""}`}>
          <div className="rbt-pickup-shipping-area pb-4 ps-3 ms-2 ms-sm-3">
            <p className="fs-sm mb-2">
              Choose a store nearby:
            </p>
            <p className="fs-sm">
              Choose a pickup time convenient for you:
            </p>
            {renderDateTimeGrid("pickup")}
          </div>
        </div>
      </div>
      {/* Local shipping option */}
      <div className="rbt-single-shipping-method rbt-radio-accordion border-bottom">
        <div className="form-check mb-0" role="listitem">
          <label className="form-check-label d-flex align-items-center py-3">
            <input
              type="radio"
              className="rbt-form-check-input me-2 me-sm-3"
              name="shipping-method"
              checked={openMethod === "local"}
              onChange={() => setOpenMethod("local")}
            />
            Local shipping
            <span className="fw-normal ms-auto">
              $23.40
            </span>
          </label>
        </div>
        <div className={`collapse${openMethod === "local" ? " show" : ""}`}>
          <div className="rbt-local-shipping-area pb-4 ps-3 ms-2 ms-sm-3">
            <div className="alert rbt-alert-brand d-flex align-items-center alert-info mb-3" role="alert">
              <i className="fa-regular fa-circle-info mr--4" />
              <div className="fs-sm">
                Local shipping can take up to
                <span className="text-info-emphasis fw-semibold">
                  5
                </span>
                business days.
              </div>
            </div>
            <p className="fs-sm mb-0">
              Estimated date of delivery -
              <span className="text-body-emphasis fw-medium">
                March 31, 2025
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
