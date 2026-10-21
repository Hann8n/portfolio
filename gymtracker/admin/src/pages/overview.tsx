import { useState } from "react";
import { BarList } from "@/components/bar-list";
import { TimeBarChart } from "@/components/bar-chart";
import { DeltaBadge } from "@/components/delta-badge";
import { Heatmap, timingInsight } from "@/components/heatmap";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { ErrorState, LoadingGrid } from "@/components/states";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOverview, type DailyRow, type Overview as OverviewData } from "@/lib/api";
import { useFilters } from "@/lib/filters";
import { day, num, pct, shortDate } from "@/lib/format";

const SERIES = {
  active: { label: "Active installs", unit: "active installs" },
  new_installs: { label: "New installs", unit: "new installs" },
  sessions: { label: "App visits", unit: "visits" },
  passport_opens: { label: "Campus ID opens", unit: "Campus ID opens" },
  event_opens: { label: "Recreation event opens", unit: "event opens" },
  settings_opens: { label: "Settings opens", unit: "Settings opens" },
  siri_actions: { label: "Siri requests", unit: "Siri requests" },
} satisfies Record<string, { label: string; unit: string }>;
type Series = keyof typeof SERIES & keyof DailyRow;
const SERIES_KEY = "gymtracker.admin.series";

export function OverviewPage() {
  const { filters } = useFilters();
  const query = useOverview(filters);
  const [series, setSeriesState] = useState<Series>(() => {
    try { const saved = localStorage.getItem(SERIES_KEY); return saved && saved in SERIES ? (saved as Series) : "active"; } catch { return "active"; }
  });
  const setSeries = (next: Series) => { setSeriesState(next); try { localStorage.setItem(SERIES_KEY, next); } catch { /* optional */ } };

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" description={query.data ? <>Last {query.data.days} days · Eastern Time{query.data.audience.internal_excluded && query.data.audience.internal_installations ? " · internal installs excluded" : ""}</> : "How people use Gym Tracker."} />
      {query.isPending ? <LoadingGrid cards={5} /> : query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : <OverviewContent data={query.data} series={series} setSeries={setSeries} />}
    </div>
  );
}

function OverviewContent({ data, series, setSeries }: { data: OverviewData; series: Series; setSeries: (s: Series) => void }) {
  const prev = data.previous;
  const spark = (key: Series) => data.daily.map(d => d[key]);
  const kpis: { label: string; series?: Series; value: string; current: number; previous?: number; help: string }[] = [
    { label: "Active installs", series: "active", value: num(data.active_period), current: data.active_period, previous: prev?.active_period, help: `${num(data.active_24h)} in the last 24 hours` },
    { label: "New installs", series: "new_installs", value: num(data.new_installs), current: data.new_installs, previous: prev?.new_installs, help: `${pct(data.new_installs, data.active_period)} of active · first seen` },
    { label: "App visits", series: "sessions", value: num(data.sessions), current: data.sessions, previous: prev?.sessions, help: `${(data.visits_per_visitor || 0).toFixed(1)} per visiting install` },
    { label: "Returning installs", value: pct(data.returning_installs, data.active_period), current: data.returning_installs, previous: prev?.returning_installs, help: `${num(data.returning_installs)} used it on 2+ days` },
    { label: "Campus ID reach", series: "passport_opens", value: pct(data.passport_users, data.active_period), current: data.passport_users, previous: prev?.passport_users, help: `${num(data.passport_users)} installs · ${num(data.passport_opens)} opens` },
  ];
  const values = data.daily.map(d => d[series]);
  const peak = values.indexOf(Math.max(...values));
  const chart = data.daily.map((d, i) => ({
    label: day(d.date), value: d[series], previous: data.previous_daily[i]?.[series],
    tooltip: day(d.date, { weekday: "long", month: "short", day: "numeric" }),
  }));
  const timing = timingInsight(data.hourly);
  const feature = (event: string) => data.features.find(f => f.event === event) || { opens: 0, installations: 0, repeat_installations: 0 };
  const features = [["passport_open", "Campus ID"], ["event_open", "Recreation events"], ["settings_open", "Settings"]] as const;
  const buckets: [string, number[]][] = [["Background only", [0]], ["1 visit", [1]], ["2 visits", [2]], ["3–4 visits", [3, 4]], ["5–9 visits", [5, 6, 7, 8, 9]], ["10+ visits", [10]]];
  const answered = Math.max(0, data.siri_actions - data.siri_unavailable);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map(k => (
          <KpiCard key={k.label} label={k.label} value={k.value} help={k.help}
            delta={<DeltaBadge current={k.current} previous={data.comparison_available ? k.previous : null} days={data.days} />}
            sparkline={k.series ? spark(k.series) : undefined}
            selected={k.series === series} onSelect={k.series ? () => setSeries(k.series!) : undefined} />
        ))}
      </div>
      {!data.comparison_available && (
        <p className="-mt-2 text-xs text-muted-foreground">Comparisons start once {data.days * 2} days of history exist. Analytics began {shortDate(data.coverage_since)}.</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{SERIES[series].label}</CardTitle>
          <CardDescription>
            {values[peak] > 0 ? <>Peak {day(data.daily[peak].date, { weekday: "long", month: "short", day: "numeric" })}: {num(values[peak])} {SERIES[series].unit}.</> : `No ${SERIES[series].unit} recorded.`}
            {data.previous_daily.length > 0 && " Faded bars show the previous period."}
          </CardDescription>
          <CardAction>
            <Select value={series} onValueChange={v => setSeries(v as Series)}>
              <SelectTrigger size="sm" aria-label="Chart metric" id="chartMetric"><SelectValue /></SelectTrigger>
              <SelectContent align="end">{Object.entries(SERIES).map(([key, s]) => <SelectItem key={key} value={key}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent><TimeBarChart data={chart} label={SERIES[series].label} previousLabel={`Previous ${data.days} days`} /></CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>When people open the app</CardTitle><CardDescription>App visits by weekday and hour · Eastern Time</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <Heatmap rows={data.hourly} />
            {timing && <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{timing.share}%</span> of visits happen between {timing.from} and {timing.to}. Busiest day: <span className="font-medium text-foreground">{timing.day}</span>.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Visit frequency</CardTitle><CardDescription>Active installs by number of app visits</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <BarList label="Active installs by visits" items={buckets.map(([name, visits]) => {
              const installs = data.engagement.filter(r => visits.includes(r.visits)).reduce((s, r) => s + r.installs, 0);
              return { name, value: installs, display: `${pct(installs, data.active_period)} · ${num(installs)}` };
            }).filter((b, i) => i > 0 || b.value > 0)} />
            <p className="text-xs text-muted-foreground">Background-only installs used Siri or widgets without opening the app.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Feature usage</CardTitle><CardDescription>Share of active installs that used each feature. Shares overlap.</CardDescription></CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <BarList label="Feature adoption" items={[
            ...features.map(([event, name]) => ({ name, value: feature(event).installations, display: pct(feature(event).installations, data.active_period) })),
            { name: "Siri", value: data.siri_users, display: pct(data.siri_users, data.active_period) },
          ]} />
          <Table>
            <TableHeader><TableRow><TableHead>Feature</TableHead><TableHead className="text-right">Opens</TableHead><TableHead className="text-right">Installs</TableHead><TableHead className="hidden text-right sm:table-cell">Repeat use</TableHead><TableHead className="hidden text-right sm:table-cell">Per install</TableHead></TableRow></TableHeader>
            <TableBody>
              {features.map(([event, name]) => {
                const f = feature(event);
                return <TableRow key={event}><TableCell className="font-medium whitespace-normal">{name}</TableCell><TableCell className="tabular text-right">{num(f.opens)}</TableCell><TableCell className="tabular text-right">{num(f.installations)}</TableCell><TableCell className="tabular hidden text-right sm:table-cell">{num(f.repeat_installations)}</TableCell><TableCell className="tabular hidden text-right sm:table-cell">{f.installations ? (f.opens / f.installations).toFixed(1) : "—"}</TableCell></TableRow>;
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Siri requests answered</CardTitle><CardDescription>{num(answered)} of {num(data.siri_actions)} returned live or cached data</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Action</TableHead><TableHead className="text-right">Requests</TableHead><TableHead className="text-right">Answered</TableHead></TableRow></TableHeader>
              <TableBody>
                {([["siri_crowds", "Crowds & gym choice"], ["siri_events", "Find events"], ["siri_event_details", "Event details"]] as const).map(([event, name]) => {
                  const rows = data.siri.filter(r => r.event === event);
                  return <TableRow key={event}><TableCell className="font-medium whitespace-normal">{name}</TableCell><TableCell className="tabular text-right">{num(rows.reduce((s, r) => s + Number(r.count), 0))}</TableCell><TableCell className="tabular text-right">{num(rows.filter(r => r.status === "live" || r.status === "cached").reduce((s, r) => s + Number(r.count), 0))}</TableCell></TableRow>;
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Platform</CardTitle><CardDescription>Each install counted once, on its latest version</CardDescription></CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div className="space-y-3"><h3 className="text-sm font-medium">App version</h3><BarList label="Installs by app version" items={data.versions.slice(0, 5).map(v => ({ name: `${v.app_version} (${v.build})`, value: v.installs, display: pct(v.installs, data.active_period) }))} /></div>
            <div className="space-y-3"><h3 className="text-sm font-medium">OS</h3><BarList label="Installs by OS version" items={data.os.slice(0, 5).map(v => ({ name: v.name, value: v.installs, display: pct(v.installs, data.active_period) }))} /></div>
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground">Active installs include background Siri use; visits count foreground use only. Collection is best effort, and missing data does not establish zero usage.</p>
    </>
  );
}
