// Coupon expiry is picked as a calendar date in the admin form but stored as a timestamp
// (coupons.expires_at). The store only sells in Pakistan (PKR, see lib/currency.ts), so a coupon is
// valid through the end of its expiry day in Pakistan time, whatever timezone the server or the
// admin's browser is in. Kept free of server-only imports so the admin form can use it too.

const STORE_TIME_ZONE = "Asia/Karachi";
const STORE_UTC_OFFSET = "+05:00"; // Pakistan has no daylight saving

// "2026-09-30" -> "2026-09-30T23:59:59.999+05:00"
export function expiryDateToTimestamp(date: string): string {
  return `${date}T23:59:59.999${STORE_UTC_OFFSET}`;
}

// Inverse of expiryDateToTimestamp, for prefilling the form's date input: -> "2026-09-30"
export function timestampToExpiryDate(timestamp: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STORE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp));
}

// Display form for tables: -> "Sep 30, 2026"
export function formatExpiryDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    timeZone: STORE_TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
