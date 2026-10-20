import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router";
import { CampaignEditor } from "@/components/campaign-editor";
import { PageHeader, Section } from "@/components/page-header";
import { CampaignStatusBadge } from "@/components/status-badge";
import { EmptyState, ErrorState, LoadingGrid } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { campaignDates as dateRange, campaignStatus, useCampaigns, useOverview, type Campaign, type CampaignStatus } from "@/lib/api";
import { useFilters } from "@/lib/filters";
import { num, tapRate } from "@/lib/format";
import { cn } from "@/lib/utils";

const ORDER: CampaignStatus[] = ["live", "scheduled", "paused", "ended"];
type StatusFilter = "all" | CampaignStatus;

export function CampaignsPage() {
  const campaigns = useCampaigns();
  const { filters } = useFilters();
  const overview = useOverview(filters);
  const { search } = useLocation();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<{ open: boolean; campaign: Campaign | null }>({ open: false, campaign: null });
  const ads = campaigns.data || [];
  const counts = useMemo(() => Object.fromEntries(ORDER.map(s => [s, ads.filter(a => campaignStatus(a) === s).length])), [ads]);
  const visible = ads
    .filter(a => status === "all" || campaignStatus(a) === status)
    .filter(a => !query.trim() || (a.sponsor + " " + a.id).toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => ORDER.indexOf(campaignStatus(a)) - ORDER.indexOf(campaignStatus(b)) || (Date.parse(b.start_at || "") || 0) - (Date.parse(a.start_at || "") || 0));

  return (
    <div className="space-y-6">
      <PageHeader title="Campaigns" description="Schedule sponsor ads, check delivery, and export reports."
        actions={<Button onClick={() => setEditing({ open: true, campaign: null })}><PlusIcon /> New campaign</Button>} />
      {campaigns.isPending ? <LoadingGrid cards={3} className="h-36" /> : campaigns.isError ? <ErrorState error={campaigns.error} onRetry={() => campaigns.refetch()} /> : (
        <>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={status} onValueChange={v => setStatus(v as StatusFilter)} className="min-w-0">
              <div className="-mx-1 overflow-x-auto px-1 pb-1"><TabsList>
                <TabsTrigger value="all">All <span className="tabular text-muted-foreground">{ads.length}</span></TabsTrigger>
                {ORDER.map(s => <TabsTrigger key={s} value={s} className="capitalize">{s} <span className="tabular text-muted-foreground">{counts[s]}</span></TabsTrigger>)}
              </TabsList></div>
            </Tabs>
            <div className="relative sm:w-64">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search sponsor or ID" className="pl-8" aria-label="Search campaigns" />
            </div>
          </div>
          {visible.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map(ad => {
                const stats = overview.data?.per_ad.find(r => r.ad_id === ad.id);
                return (
                  <Link key={ad.id} to={{ pathname: "/campaigns/" + encodeURIComponent(ad.id), search }} className="group rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
                    <Card className="h-full gap-3 py-4 transition-colors group-hover:border-ring/60">
                      <CardContent className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0"><p className="truncate font-medium">{ad.sponsor}</p><p className="truncate font-mono text-xs text-muted-foreground">{ad.id}</p></div>
                          <CampaignStatusBadge status={campaignStatus(ad)} />
                        </div>
                        <p className="text-sm text-muted-foreground">{dateRange(ad)} · <span className="capitalize">{ad.tier || "banner"}</span></p>
                        <dl className="grid grid-cols-3 gap-2 border-t pt-3 text-sm">
                          <div><dt className="text-xs text-muted-foreground">Views</dt><dd className="tabular font-medium">{stats ? num(stats.impressions) : "—"}</dd></div>
                          <div><dt className="text-xs text-muted-foreground">Reach</dt><dd className="tabular font-medium">{stats ? num(stats.reach) : "—"}</dd></div>
                          <div><dt className="text-xs text-muted-foreground">Tap rate</dt><dd className="tabular font-medium">{stats ? tapRate(stats.impressions, stats.clicks) : "—"}</dd></div>
                        </dl>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : <EmptyState>{ads.length ? "No campaigns match these filters." : "No campaigns yet. Create one to start delivering ads."}</EmptyState>}
          <p className="-mt-2 text-xs text-muted-foreground">Delivery figures cover the last {filters.days} days.</p>
          <Section title="Schedule" description="Overlapping campaigns are outlined; only the latest-starting live campaign shows in the app.">
            <CampaignCalendar ads={ads} />
          </Section>
        </>
      )}
      <CampaignEditor open={editing.open} campaign={editing.campaign} existingIds={ads.map(a => a.id)} onOpenChange={open => setEditing(e => ({ ...e, open }))} />
    </div>
  );
}

const STATUS_FILL: Record<CampaignStatus, string> = {
  live: "bg-success/15 text-success", scheduled: "bg-chart-3/15 text-chart-3", paused: "bg-warning/15 text-warning", ended: "bg-muted text-muted-foreground",
};

function CampaignCalendar({ ads }: { ads: Campaign[] }) {
  const { search } = useLocation();
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const cells = Array.from({ length: Math.ceil((first.getDay() + new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()) / 7) * 7 }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i - first.getDay() + 1));
  const today = new Date().toDateString();
  const adsOn = (d: Date) => ads.filter(ad => {
    if (!ad.start_at && !ad.end_at) return false;
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(), end = start + 86_399_999;
    return (ad.start_at ? Date.parse(ad.start_at) : 0) <= end && (ad.end_at ? Date.parse(ad.end_at) : Infinity) >= start;
  });
  const move = (months: number) => setCursor(c => new Date(c.getFullYear(), c.getMonth() + months, 1));
  return (
    <Card className="gap-4 py-4">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium" aria-live="polite">{cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h3>
          <div className="flex gap-1">
            <Button size="icon" variant="outline" onClick={() => move(-1)} aria-label="Previous month"><ChevronLeftIcon /></Button>
            <Button size="sm" variant="outline" onClick={() => { const d = new Date(); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)); }}>Today</Button>
            <Button size="icon" variant="outline" onClick={() => move(1)} aria-label="Next month"><ChevronRightIcon /></Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border text-xs">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} className="bg-card py-1.5 text-center text-muted-foreground">{d}</div>)}
          {cells.map(d => {
            const list = adsOn(d), inMonth = d.getMonth() === cursor.getMonth();
            return (
              <div key={d.toISOString()} className={cn("min-h-14 bg-card p-1 sm:min-h-20 sm:p-1.5", !inMonth && "bg-background text-muted-foreground/60", list.length > 1 && "outline outline-1 -outline-offset-1 outline-warning")}>
                <div className={cn("mb-1 text-[11px]", d.toDateString() === today && "font-semibold text-chart-1")}>{d.getDate()}</div>
                <div className="space-y-0.5">
                  {list.map(ad => (
                    <Link key={ad.id} to={{ pathname: "/campaigns/" + encodeURIComponent(ad.id), search }} title={`${ad.sponsor} · ${dateRange(ad)}`}
                      className={cn("block truncate rounded px-1 py-0.5 text-[10px] leading-tight sm:text-[11px]", STATUS_FILL[campaignStatus(ad)])}>
                      <span className="hidden sm:inline">{ad.sponsor}</span><span className="sm:hidden" aria-label={ad.sponsor}>●</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
