/**
 * Date utility functions for converting UTC timestamps to Hong Kong timezone
 * Backend stores all dates in UTC (ISO 8601 format with Z)
 * Frontend displays dates in HK timezone (UTC+8)
 */

const HK_TIMEZONE = "Asia/Hong_Kong";

/**
 * Convert UTC timestamp to HK timezone date string (YYYY-MM-DD)
 * @param utcDate - ISO 8601 date string or Date object from API
 * @returns Date string in YYYY-MM-DD format (HK timezone)
 * @example toHKDateString("2025-12-06T02:30:00.000Z") => "2025-12-06" (HK: 10:30 AM)
 */
export const toHKDateString = (utcDate: string | Date): string => {
  const date = new Date(utcDate);
  return date.toLocaleDateString("en-CA", {
    timeZone: HK_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }); // en-CA gives YYYY-MM-DD format
};

/**
 * Convert UTC timestamp to HK timezone time string (HH:MM)
 * @param utcDate - ISO 8601 date string or Date object from API
 * @returns Time string in HH:MM format (24-hour, HK timezone)
 * @example toHKTimeString("2025-12-06T02:30:00.000Z") => "10:30" (HK: UTC+8)
 */
export const toHKTimeString = (utcDate: string | Date): string => {
  const date = new Date(utcDate);
  return date.toLocaleTimeString("en-HK", {
    timeZone: HK_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

/**
 * Convert UTC timestamp to full HK datetime string
 * @param utcDate - ISO 8601 date string or Date object from API
 * @returns Full datetime string in HK timezone
 * @example toHKDateTimeString("2025-12-06T02:30:00.000Z") => "12/6/2025, 10:30:00 AM"
 */
export const toHKDateTimeString = (utcDate: string | Date): string => {
  const date = new Date(utcDate);
  return date.toLocaleString("en-HK", {
    timeZone: HK_TIMEZONE,
  });
};

/**
 * Convert UTC Date to HK timezone for datetime-local input (YYYY-MM-DDTHH:MM)
 * Used for prefilling HTML5 datetime-local inputs
 * @param utcDate - ISO 8601 date string or Date object from API
 * @returns Datetime string in YYYY-MM-DDTHH:MM format (HK timezone)
 * @example toHKInputValue("2025-12-06T02:30:00.000Z") => "2025-12-06T10:30"
 */
export const toHKInputValue = (utcDate: string | Date): string => {
  const date = new Date(utcDate);

  // Get HK date components
  const year = date.toLocaleString("en-US", {
    timeZone: HK_TIMEZONE,
    year: "numeric",
  });
  const month = date
    .toLocaleString("en-US", { timeZone: HK_TIMEZONE, month: "2-digit" })
    .padStart(2, "0");
  const day = date
    .toLocaleString("en-US", { timeZone: HK_TIMEZONE, day: "2-digit" })
    .padStart(2, "0");
  const hour = date
    .toLocaleString("en-US", {
      timeZone: HK_TIMEZONE,
      hour: "2-digit",
      hour12: false,
    })
    .padStart(2, "0");
  const minute = date
    .toLocaleString("en-US", { timeZone: HK_TIMEZONE, minute: "2-digit" })
    .padStart(2, "0");

  return `${year}-${month}-${day}T${hour}:${minute}`;
};
