import { ExternalLinkIcon, PauseIcon, PencilIcon, PlayIcon } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { toast } from "sonner";
import { AdPreview } from "@/components/ad-preview";
import { BarList } from "@/components/bar-list";
import { TimeBarChart } from "@/components/bar-chart";
import { CampaignEditor } from "@/components/campaign-editor";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { CampaignStatusBadge } from "@/components/status-badge";
import { EmptyState, ErrorState, LoadingGrid } from "@/components/states";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { campaignDates as dateRange, campaignStatus, reportUrl, useCampaignReport, useCampaigns, useSaveCampaign, type CampaignReport } from "@/lib/api";
import { PERIODS, useFilters } from "@/lib/filters";
import { dateTime, day, hourLabel, num, pct, ratio, tapRate } from "@/lib/format";

export function CampaignDetailPage() {
  const { id } = useParams();
  const { search } = useLocation();
  const { filters } = useFilters();
  const campaigns = useCampaigns();
  const [reportDays, setReportDays] = useState<string>(filters.days);
  const report = useCampaignReport(id, filters, reportDays);
  const save = useSaveCampaign();
  const [editing, setEditing] = useState(false);
  const ad = campaigns.data?.find(a => a.id === id);

  if (campaigns.isPending) return <LoadingGrid cards={4} />;
  if (campaigns.isError) return <ErrorState error={campaigns.error} onRetry={() => campaigns.refetch()} />;
  if (!ad) return <EmptyState>Campaign “{id}” was not found. <Link className="underline" to={{ pathname: "/campaigns", search }}>Back to campaigns</Link></EmptyState>;
  const status = campaignStatus(ad);
  const toggle = async () => {
    try { await save.mutateAsync({ ...ad, active: !ad.active }); toast.success(ad.active ? "Campaign paused" : "Campaign resumed"); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not update"); }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to={{ pathname: "/campaigns", search }}>Campaigns</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage className="truncate">{ad.sponsor}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader title={<span className="flex flex-wrap items-center gap-3">{ad.sponsor}<CampaignStatusBadge status={status} /></span>} description={<>{ad.headline} · <span className="font-mono">{ad.id}</span></>}
        actions={<>
          <Button variant="outline" onClick={() => setEditing(true)}><PencilIcon /> Edit</Button>
          {(status === "live" || status === "paused") && <Button variant="outline" onClick={toggle} disabled={save.isPending}>{ad.active ? <><PauseIcon /> Pause</> : <><PlayIcon /> Resume</>}</Button>}
          <Button asChild><a href={reportUrl(ad.id, filters, reportDays)} target="_blank" rel="noopener">Sponsor report <ExternalLinkIcon /></a></Button>
        </>} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{dateRange(ad)} · <span className="capitalize">{ad.tier || "banner"}</span> · Home feed</p>
        <Select value={reportDays} onValueChange={setReportDays}>
          <SelectTrigger size="sm" aria-label="Campaign reporting period"><SelectValue /></SelectTrigger>
          <SelectContent align="end"><SelectItem value="campaign">Campaign dates</SelectItem>{PERIODS.map(p => <SelectItem key={p} value={p}>Last {p} days</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {report.isPending ? <LoadingGrid cards={5} /> : report.isError ? <ErrorState error={report.error} onRetry={() => report.refetch()} /> : <Delivery report={report.data} />}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <Card>
          <CardHeader><CardTitle>Creative</CardTitle><CardDescription>Current saved version</CardDescription></CardHeader>
          <CardContent><AdPreview ad={ad} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
              {([["Starts", dateTime(ad.start_at)], ["Ends", dateTime(ad.end_at)], ["Label", ad.sponsored_label ?? "Sponsored"], ["Version", ad.creative_version || "Not set"], ["Link button", ad.cta]] as const).map(([k, v]) => (
                <div key={k}><dt className="text-muted-foreground">{k}</dt><dd className="font-medium break-words">{v || "None"}</dd></div>
              ))}
              <div className="sm:col-span-2"><dt className="text-muted-foreground">Destination</dt><dd className="font-medium break-all"><a className="underline-offset-4 hover:underline" href={ad.destination_url} target="_blank" rel="noopener noreferrer">{ad.destination_url}</a></dd></div>
            </dl>
          </CardContent>
        </Card>
      </div>
      <CampaignEditor open={editing} campaign={ad} existingIds={(campaigns.data || []).map(a => a.id)} onOpenChange={setEditing} />
    </div>
  );
}

function Delivery({ report }: { report: CampaignReport }) {
  const hasData = report.impressions > 0 || report.clicks > 0;
  if (!hasData) return <EmptyState>{report.period.not_started ? "This campaign hasn’t started yet." : "No delivery recorded in this period."}</EmptyState>;
  const span = report.first_event && report.last_event ? (Date.parse(report.last_event) - Date.parse(report.first_event)) / 86_400_000 : 0;
  const hourly = span <= 4 && report.timeline.length > 0;
  const chart = hourly
    ? report.timeline.map(t => { const [date, hour] = t.slot.split(" "); return { label: Number(hour) === 0 ? day(date) : hourLabel(Number(hour)), value: t.impressions, tooltip: `${day(date, { weekday: "short", month: "short", day: "numeric" })}, ${hourLabel(Number(hour))}` }; })
    : report.daily.map(d => ({ label: day(d.date), value: d.impressions, tooltip: day(d.date, { weekday: "long", month: "short", day: "numeric" }) }));
  return (
    <>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Ad views" value={num(report.impressions)} help="Half visible for 1 second" />
        <KpiCard label="Unique reach" value={num(report.reach)} help="App installs with a view" />
        <KpiCard label="Avg. frequency" value={ratio(report.impressions, report.reach)} help="Views per reached install" />
        <KpiCard label="Link taps" value={num(report.clicks)} help={`${num(report.unique_clickers)} unique install${report.unique_clickers === 1 ? "" : "s"}`} />
        <KpiCard label="Tap rate" value={tapRate(report.impressions, report.clicks)} help="Taps ÷ views" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader><CardTitle>Delivery</CardTitle><CardDescription>Ad views per {hourly ? "hour" : "day"} · Eastern Time</CardDescription></CardHeader>
          <CardContent><TimeBarChart data={chart} label="Ad views" height={220} compact={hourly} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Views per reached install</CardTitle><CardDescription>Frequency distribution</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <BarList label="Reached installs by views" items={[1, 2, 3, 4, 5].map(v => {
              const installs = report.frequency.find(f => f.views === v)?.installs || 0;
              return { name: v === 5 ? "5 or more" : `${v} view${v === 1 ? "" : "s"}`, value: installs, display: pct(installs, report.reach) };
            })} />
            {report.excluded.installations > 0 && <p className="text-xs text-muted-foreground">Excludes {num(report.excluded.impressions)} views and {num(report.excluded.clicks)} taps from {num(report.excluded.installations)} internal install{report.excluded.installations === 1 ? "" : "s"}.</p>}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
