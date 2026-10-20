/**
 * Single source of truth for tracked events. The dashboard, CSV export, and ingestion allowlist read this.
 * Adding an event also requires a D1 migration, because metric_events.event has a CHECK constraint.
 */
export type EventCategory = "product" | "ads" | "siri";

export const EVENT_CATALOG = {
  app_session: { label: "App opened", description: "A foreground visit to the app", category: "product" },
  passport_open: { label: "Campus ID opened", description: "Campus ID screen viewed", category: "product" },
  event_open: { label: "Recreation event opened", description: "Recreation event details viewed", category: "product" },
  settings_open: { label: "Settings opened", description: "Settings screen viewed", category: "product" },
  ad_impression: { label: "Ad viewed", description: "Qualified view in the home feed", category: "ads" },
  ad_tap: { label: "Ad link tapped", description: "Ad link button tapped", category: "ads" },
  siri_crowds: { label: "Siri · Current crowds", description: "Crowd checks and gym recommendations", category: "siri" },
  siri_events: { label: "Siri · Find events", description: "Requests to find recreation events", category: "siri" },
  siri_event_details: { label: "Siri · Event details", description: "Requests for a specific event’s details", category: "siri" },
} as const satisfies Record<string, { label: string; description: string; category: EventCategory }>;

export type EventName = keyof typeof EVENT_CATALOG;
export const EVENT_NAMES = Object.keys(EVENT_CATALOG) as EventName[];
export const SIRI_ANSWERED = ["live", "cached"] as const;
export const SIRI_FAILED = ["unavailable", "not_found", "invalid_request"] as const;
