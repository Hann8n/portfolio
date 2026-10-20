import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { filterQuery, type Filters } from "./filters";
import { shortDate } from "./format";

/** Typed client for the Worker's admin API. Every endpoint is behind Cloudflare Access. */
export class ApiError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    credentials: "include", ...init,
    headers: { ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
  });
  if (response.status === 401) throw new ApiError("Your sign-in expired. Reload the page to sign in again.", 401);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError((body as { error?: string }).error || response.statusText || "Request failed", response.status);
  return body as T;
}

// ── Types (mirror src/analytics/* responses) ──────────────────────────────

export type Tier = "text" | "banner" | "feature";
export interface Campaign {
  id: string; active: boolean; sponsor: string; sponsored_label?: string; headline: string; subline?: string | null;
  cta: string; destination_url: string; image_url?: string | null; logo_url?: string | null; creative_version?: string;
  placement?: string; start_at?: string; end_at?: string; tier?: Tier;
}
export type CampaignStatus = "live" | "scheduled" | "paused" | "ended";

export interface Totals {
  active_period: number; active_24h: number; sessions: number; visitors: number; visits_per_visitor: number;
  passport_opens: number; passport_users: number; event_opens: number; event_users: number; settings_opens: number;
  siri_actions: number; siri_unavailable: number; siri_users: number;
  impressions: number; clicks: number; reach: number; unique_clickers: number; ctr_percent: number;
  new_installs: number; returning_installs: number;
}
export interface DailyRow {
  date: string; active: number; new_installs: number; sessions: number; passport_opens: number; event_opens: number;
  settings_opens: number; siri_actions: number; impressions: number; clicks: number;
}
export interface Overview extends Totals {
  configured: boolean; days: number; time_zone: string; comparison_available: boolean;
  period: { from: string; before: string }; previous_period: { from: string; before: string };
  coverage_since: string | null; latest_event: string | null;
  audience: { internal_excluded: boolean; internal_installations: number; internal_events: number; internal_impressions: number; internal_clicks: number };
  previous: Totals | null; daily: DailyRow[]; previous_daily: DailyRow[];
  hourly: { dow: number; hour: number; sessions: number; installs: number }[];
  engagement: { visits: number; installs: number }[];
  features: { event: string; opens: number; installations: number; repeat_installations: number }[];
  siri: { event: string; status: string; count: number }[];
  versions: { app_version: string; build: string; installs: number }[];
  os: { name: string; installs: number }[];
  per_ad: { ad_id: string; impressions: number; clicks: number; reach: number; ctr_percent: number }[];
}
export interface CampaignReport {
  campaign: Campaign; generated_at: string;
  period: { from: string; before: string; label: string; truncated: boolean; not_started: boolean };
  impressions: number; clicks: number; reach: number; unique_clickers: number; first_event: string | null; last_event: string | null;
  daily: { date: string; impressions: number; clicks: number; reach: number }[];
  hourly: { hour: number; impressions: number; clicks: number }[];
  timeline: { slot: string; impressions: number; clicks: number }[];
  frequency: { views: number; installs: number }[];
  creatives: { creative_version: string; impressions: number; clicks: number }[];
  excluded: { internal_excluded: boolean; installations: number; impressions: number; clicks: number };
}
export interface EventRow { event: string; occurrences: number; installations: number; sessions: number; last_received: string }
export interface EventsResponse { days: number; campaign: string | null; period: { from: string; before: string }; internal_excluded: boolean; events: EventRow[] }
export interface AudienceReview {
  internal_excluded: boolean;
  internal: { id: string; label: string; added_at: string; events: number; sessions: number; last_seen: string | null }[];
  candidates: { installation_id: string; events: number; sessions: number; build_list: string; os_version: string; flags: string[]; last_seen: string }[];
  coverage: { since?: string | null; latest?: string | null; events?: number; events_24h?: number };
}

// ── Queries ───────────────────────────────────────────────────────────────

export const useOverview = (filters: Filters) =>
  useQuery({ queryKey: ["overview", filters], queryFn: () => request<Overview>("/api/admin/stats?" + filterQuery(filters)) });

export const useCampaigns = () =>
  useQuery({ queryKey: ["campaigns"], queryFn: async () => (await request<{ ads: Campaign[] }>("/api/admin/ads")).ads.filter(ad => ad && typeof ad.id === "string") });

export const useCampaignReport = (id: string | undefined, filters: Filters, days: string = filters.days) =>
  useQuery({
    queryKey: ["campaign-report", id, days, filters.excludeInternal], enabled: !!id,
    queryFn: () => request<CampaignReport>("/api/admin/campaign-report?" + filterQuery({ ...filters, days: days as Filters["days"] }, { id: id!, format: "json" })),
  });

export const useEvents = (filters: Filters, campaign: string) =>
  useQuery({ queryKey: ["events", filters, campaign], queryFn: () => request<EventsResponse>("/api/admin/events?" + filterQuery(filters, campaign ? { campaign } : {})) });

export const useAudience = () => useQuery({ queryKey: ["audience"], queryFn: () => request<AudienceReview>("/api/admin/audience") });

// ── Mutations ─────────────────────────────────────────────────────────────

export function useSaveCampaign() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (campaign: Campaign) => request<Campaign>("/api/admin/ads", { method: "PUT", body: JSON.stringify(campaign) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

export function useDeleteCampaign() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => request<{ deleted: string }>("/api/admin/ads?id=" + encodeURIComponent(id), { method: "DELETE" }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

export function useSetInternal() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; label?: string; internal: boolean }) => request("/api/admin/audience", { method: "PUT", body: JSON.stringify(input) }),
    // Exclusions change every figure, so refresh everything.
    onSuccess: () => client.invalidateQueries(),
  });
}

// ── Campaign helpers ──────────────────────────────────────────────────────

export function campaignStatus(ad: Campaign, now = Date.now()): CampaignStatus {
  if (!ad.active) return "paused";
  if (ad.start_at && now < Date.parse(ad.start_at)) return "scheduled";
  if (ad.end_at && now > Date.parse(ad.end_at)) return "ended";
  return "live";
}

export function reportUrl(id: string, filters: Filters, days: string = filters.days) {
  return "/api/admin/campaign-report?" + filterQuery({ ...filters, days: days as Filters["days"] }, { id });
}

export function campaignDates(ad: Campaign) {
  if (ad.start_at && ad.end_at) return `${shortDate(ad.start_at)} – ${shortDate(ad.end_at)}`;
  if (ad.start_at) return "From " + shortDate(ad.start_at);
  if (ad.end_at) return "Until " + shortDate(ad.end_at);
  return "No dates";
}
