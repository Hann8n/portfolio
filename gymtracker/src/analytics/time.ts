import { raw, sql, type Fragment } from "./sql";

/** Gym Tracker serves Virginia Tech, so day and hour breakdowns use campus time. Storage stays UTC. */
export const REPORT_TIME_ZONE = "America/New_York";
export const REPORT_TIME_ZONE_LABEL = "ET";
export const DAY = 86400000;
const MINUTE = 60000;

const partsFormatter = new Map<string, Intl.DateTimeFormat>();
function formatter(timeZone: string) {
  let f = partsFormatter.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    partsFormatter.set(timeZone, f);
  }
  return f;
}

function wallClock(at: number, timeZone: string) {
  const parts: Record<string, number> = {};
  for (const part of formatter(timeZone).formatToParts(new Date(at))) if (part.type !== "literal") parts[part.type] = Number(part.value);
  return parts;
}

/** Local minus UTC, in minutes, at an instant. */
export function zoneOffsetMinutes(at: number, timeZone = REPORT_TIME_ZONE): number {
  const p = wallClock(at, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(at / 1000) * 1000) / MINUTE);
}

/** Offset segments covering [from, before): each applies from `start` until the next segment. */
export function offsetSegments(from: number, before: number, timeZone = REPORT_TIME_ZONE) {
  const segments = [{ start: from, offset: zoneOffsetMinutes(from, timeZone) }];
  let previous = from;
  while (previous < before) {
    const next = Math.min(previous + DAY, before);
    const current = segments[segments.length - 1].offset;
    if (zoneOffsetMinutes(next, timeZone) !== current) {
      let lo = Math.floor(previous / MINUTE), hi = Math.ceil(next / MINUTE);
      while (hi - lo > 1) {
        const mid = Math.floor((lo + hi) / 2);
        if (zoneOffsetMinutes(mid * MINUTE, timeZone) === current) lo = mid; else hi = mid;
      }
      segments.push({ start: hi * MINUTE, offset: zoneOffsetMinutes(hi * MINUTE, timeZone) });
    }
    previous = next;
  }
  return segments;
}

/**
 * SQLite expression converting an ISO UTC column to local wall-clock text (`YYYY-MM-DD HH:MM:SS`).
 * D1 has no time zone database, so DST transitions inside the window become CASE boundaries.
 */
export function localTimeSql(column: string, from: number, before: number, timeZone = REPORT_TIME_ZONE): Fragment {
  const segments = offsetSegments(from - DAY, before + DAY, timeZone);
  const modifier = (offset: number) => raw(`'${Math.trunc(offset)} minutes'`);
  const col = raw(column);
  if (segments.length === 1) return sql`datetime(${col}, ${modifier(segments[0].offset)})`;
  let expression = sql`datetime(${col}, CASE`;
  for (let i = 1; i < segments.length; i++) {
    expression = sql`${expression} WHEN ${col} < ${new Date(segments[i].start).toISOString()} THEN ${modifier(segments[i - 1].offset)}`;
  }
  return sql`${expression} ELSE ${modifier(segments[segments.length - 1].offset)} END)`;
}

export function localDateSql(column: string, from: number, before: number, timeZone = REPORT_TIME_ZONE): Fragment {
  return sql`substr(${localTimeSql(column, from, before, timeZone)}, 1, 10)`;
}

/** `YYYY-MM-DD` for an instant in the reporting time zone. */
export function localDateKey(at: number, timeZone = REPORT_TIME_ZONE): string {
  const p = wallClock(at, timeZone);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** Every local calendar date touched by [from, before), oldest first. */
export function localDates(from: number, before: number, timeZone = REPORT_TIME_ZONE): string[] {
  const dates: string[] = [];
  const last = localDateKey(Math.max(from, before - 1), timeZone);
  let cursor = Date.parse(localDateKey(from, timeZone) + "T12:00:00Z");
  for (let i = 0; i < 800; i++) {
    const key = new Date(cursor).toISOString().slice(0, 10);
    dates.push(key);
    if (key >= last) break;
    cursor += DAY;
  }
  return dates;
}
