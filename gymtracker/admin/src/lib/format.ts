/** Display formatting. All calendar dates and times are campus time (Eastern). */
export const TIME_ZONE = "America/New_York";

export const num = (value: unknown) => (Number(value) || 0).toLocaleString("en-US");
export const pct = (part: number, whole: number, digits = 0) => (whole ? ((part / whole) * 100).toFixed(digits) + "%" : "—");
export const tapRate = (views: number, taps: number) => (views ? ((taps / views) * 100).toFixed(2) + "%" : "—");
export const ratio = (a: number, b: number, digits = 2) => (b ? (a / b).toFixed(digits) : "—");

/** `YYYY-MM-DD` keys from the API are already local dates. */
export const day = (key: string, options: Intl.DateTimeFormatOptions = {}) =>
  new Date(key + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC", ...options });

export const dateTime = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: TIME_ZONE, timeZoneName: "short" }) : "Not set";

export const shortDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: TIME_ZONE }) : "—";

export const hourLabel = (hour: number) => `${hour % 12 || 12} ${hour < 12 ? "AM" : "PM"}`;

export function relativeTime(value: string | null | undefined) {
  if (!value) return "—";
  const ms = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(ms)) return "—";
  if (ms < 90_000) return "just now";
  if (ms < 5_400_000) return `${Math.round(ms / 60_000)} min ago`;
  if (ms < 129_600_000) return `${Math.round(ms / 3_600_000)} hr ago`;
  return `${Math.round(ms / 86_400_000)} days ago`;
}

/** Percent change, or null when there is no comparison period. */
export function change(current: number, previous: number | null | undefined) {
  if (previous == null) return null;
  if (!previous) return current ? { value: Infinity, label: "New" } : { value: 0, label: "No change" };
  const value = ((current - previous) / previous) * 100;
  if (Math.abs(value) < 0.5) return { value: 0, label: "No change" };
  return { value, label: `${value > 0 ? "+" : "−"}${Math.abs(value).toFixed(Math.abs(value) < 10 ? 1 : 0)}%` };
}
