import { useCallback } from "react";
import { useSearchParams } from "react-router";

/**
 * Global filters live in the URL (shareable, back-button friendly) with the last choice remembered as the default.
 * `?days=30&internal=include`
 */
export const PERIODS = ["7", "30", "90", "180", "365"] as const;
export type Period = (typeof PERIODS)[number];
export interface Filters { days: Period; excludeInternal: boolean }

const KEY = "gymtracker.admin.filters";
function saved(): Partial<Filters> {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch { return {}; }
}

export function useFilters() {
  const [params, setParams] = useSearchParams();
  const stored = saved();
  const rawDays = params.get("days") ?? stored.days;
  const days: Period = PERIODS.includes(rawDays as Period) ? (rawDays as Period) : "7";
  const internal = params.get("internal");
  const excludeInternal = internal ? internal !== "include" : stored.excludeInternal !== false;
  const filters: Filters = { days, excludeInternal };
  const setFilters = useCallback((patch: Partial<Filters>) => {
    const next = { ...filters, ...patch };
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* Preferences are optional. */ }
    setParams(current => {
      const updated = new URLSearchParams(current);
      updated.set("days", next.days);
      if (next.excludeInternal) updated.delete("internal"); else updated.set("internal", "include");
      return updated;
    }, { replace: true });
  }, [filters.days, filters.excludeInternal, setParams]); // eslint-disable-line react-hooks/exhaustive-deps
  return { filters, setFilters };
}

/** Query string carrying the global filters to API calls and links. */
export function filterQuery(filters: Filters, extra: Record<string, string> = {}) {
  const query = new URLSearchParams({ days: filters.days, ...extra });
  if (!filters.excludeInternal) query.set("internal", "include");
  return query.toString();
}
