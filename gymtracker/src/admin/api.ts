import { UUID, parsePlatform, resolveAudience, setInternalInstall } from "../analytics/audience";
import { fetchAudienceReview, fetchEventStats } from "../analytics/events";
import { fetchOverview } from "../analytics/overview";
import { OVERVIEW_PERIODS } from "../analytics/windows";
import { buildCampaignReport, campaignReportHtml, REPORT_PERIODS, type Campaign } from "../report/campaign-report";

/**
 * Analytics routes behind Cloudflare Access. Add a workspace's API by adding one entry here;
 * index.ts performs authentication before dispatching.
 */
export interface AdminContext {
  request: Request; env: Env; url: URL;
  json: (body: object, status?: number) => Response;
  html: (body: string, headers?: Record<string, string>) => Response;
  campaigns: () => Promise<Campaign[]>;
}
type Handler = (ctx: AdminContext) => Promise<Response>;

const periods = new Set<string>(OVERVIEW_PERIODS.map(String));
const internalMode = (url: URL) => url.searchParams.get("internal");
const platformOf = (url: URL) => parsePlatform(url.searchParams.get("platform"));

export const ADMIN_ANALYTICS_ROUTES: Record<string, Partial<Record<string, Handler>>> = {
  "/api/admin/stats": {
    async GET({ env, url, json }) {
      const days = url.searchParams.get("days") || "7";
      const platform = platformOf(url);
      if (!periods.has(days)) return json({ error: "Invalid reporting period" }, 400);
      if (platform === undefined) return json({ error: "Invalid platform" }, 400);
      try { return json(await fetchOverview(env, await resolveAudience(env, internalMode(url), platform), Number(days))); }
      catch (error) { console.error("stats failed", error); return json({ configured: true, error: "Analytics temporarily unavailable" }, 503); }
    },
  },
  "/api/admin/events": {
    async GET({ env, url, json }) {
      const days = url.searchParams.get("days") || "7";
      const campaign = url.searchParams.get("campaign");
      const platform = platformOf(url);
      if (!periods.has(days) || (campaign && campaign.length > 128) || platform === undefined) return json({ error: "Invalid event filters" }, 400);
      try { return json(await fetchEventStats(env, await resolveAudience(env, internalMode(url), platform), Number(days), campaign)); }
      catch (error) { console.error("events failed", error); return json({ error: "Events temporarily unavailable" }, 503); }
    },
  },
  "/api/admin/audience": {
    async GET({ env, json }) {
      try { return json(await fetchAudienceReview(env, await resolveAudience(env, "exclude"))); }
      catch (error) { console.error("audience failed", error); return json({ error: "Audience review temporarily unavailable" }, 503); }
    },
    async PUT({ request, env, json }) {
      let body: { id?: unknown; label?: unknown; internal?: unknown };
      try { body = await request.json(); } catch { return json({ error: "Invalid JSON body" }, 400); }
      if (typeof body.id !== "string" || !UUID.test(body.id) || typeof body.internal !== "boolean" || (body.label != null && typeof body.label !== "string"))
        return json({ error: "Expected { id: installation UUID, internal: boolean, label?: string }" }, 400);
      try { return json({ internal: await setInternalInstall(env.AD_CONFIG, body.id, (body.label as string) || "", body.internal) }); }
      catch (error) { return json({ error: error instanceof RangeError ? error.message : "Could not save" }, error instanceof RangeError ? 400 : 503); }
    },
  },
  "/api/admin/campaign-report": {
    async GET({ env, url, json, html, campaigns }) {
      const id = url.searchParams.get("id");
      const days = url.searchParams.get("days");
      const platform = platformOf(url);
      if (days !== null && !REPORT_PERIODS.includes(days)) return json({ error: "Invalid report period" }, 400);
      if (platform === undefined) return json({ error: "Invalid platform" }, 400);
      const ad = (await campaigns()).find(a => a.id === id);
      if (!ad) return json({ error: "Campaign not found" }, 404);
      try {
        const report = await buildCampaignReport(env, ad, days, await resolveAudience(env, internalMode(url), platform));
        if (url.searchParams.get("format") === "json") return json(report);
        const download = new URL(url);
        download.searchParams.set("download", "1");
        const standalone = url.searchParams.get("download") === "1";
        const filename = ad.id.replace(/[^a-z0-9_-]/gi, "-").slice(0, 80) || "campaign";
        return html(campaignReportHtml(report, download.pathname + download.search, standalone), {
          "Content-Disposition": (standalone ? "attachment" : "inline") + '; filename="' + filename + '-report.html"',
        });
      } catch (error) { console.error("campaign report failed", error); return json({ error: "Campaign reporting temporarily unavailable" }, 503); }
    },
  },
};
