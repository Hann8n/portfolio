import { DAY, REPORT_TIME_ZONE, localDateKey, localDates, zoneOffsetMinutes } from "./time";

export const OVERVIEW_PERIODS = [7, 30, 90, 180, 365] as const;
export const RETENTION_DAYS = 366;

/** UTC instant of local midnight on `date` (YYYY-MM-DD). */
export function localMidnight(date: string, timeZone = REPORT_TIME_ZONE): number {
  const wall = Date.parse(date + "T00:00:00Z");
  let guess = wall - zoneOffsetMinutes(wall, timeZone) * 60000;
  guess = wall - zoneOffsetMinutes(guess, timeZone) * 60000;
  return guess;
}

function shiftDate(date: string, days: number) {
  return new Date(Date.parse(date + "T12:00:00Z") + days * DAY).toISOString().slice(0, 10);
}

/**
 * "Last N days" means today plus the N-1 previous calendar days in campus time.
 * The comparison window has the same length and elapsed time, so a partial today is compared with a partial day.
 */
export function overviewWindows(days: number, now = Date.now(), timeZone = REPORT_TIME_ZONE) {
  const today = localDateKey(now, timeZone);
  const firstDate = shiftDate(today, -(days - 1));
  const from = localMidnight(firstDate, timeZone);
  const previousFrom = localMidnight(shiftDate(firstDate, -days), timeZone);
  const previousBefore = Math.min(from, previousFrom + (now - from));
  return {
    current: { from, before: now, dates: localDates(from, now, timeZone) },
    previous: { from: previousFrom, before: previousBefore, dates: localDates(previousFrom, previousBefore, timeZone) },
  };
}
