import { DownloadIcon } from "lucide-react";
import { useState } from "react";
import { EVENT_CATALOG, type EventCategory } from "../../../src/analytics/catalog";
import { PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCampaigns, useEvents, type EventRow } from "@/lib/api";
import { useFilters } from "@/lib/filters";
import { dateTime, num } from "@/lib/format";

const CATEGORIES: { value: "all" | EventCategory; label: string }[] = [
  { value: "all", label: "All events" }, { value: "product", label: "Product usage" }, { value: "ads", label: "Advertising" }, { value: "siri", label: "Siri" },
];
const info = (event: string) => EVENT_CATALOG[event as keyof typeof EVENT_CATALOG] ?? { label: event, description: "Recorded app interaction", category: "product" as const };

export function EventsPage() {
  const { filters } = useFilters();
  const [campaign, setCampaign] = useState("all");
  const [category, setCategory] = useState<"all" | EventCategory>("all");
  const campaigns = useCampaigns();
  const events = useEvents(filters, campaign === "all" ? "" : campaign);
  const rows = (events.data?.events || []).filter(r => category === "all" || info(r.event).category === category);

  const exportCsv = () => {
    const cell = (v: unknown) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
    const period = events.data?.period;
    const lines = [["Event", "Label", "Category", "Times recorded", "Unique app installs", "Unique sessions", "Last recorded (UTC)", "Period start (UTC)", "Period end (UTC)", "Internal installs excluded"],
      ...rows.map((r: EventRow) => [r.event, info(r.event).label, info(r.event).category, r.occurrences, r.installations, r.sessions, r.last_received, period?.from, period?.before, filters.excludeInternal ? "yes" : "no"])];
    const url = URL.createObjectURL(new Blob([lines.map(l => l.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }));
    Object.assign(document.createElement("a"), { href: url, download: `gymtracker-events-${filters.days}d.csv` }).click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Events" description={`Every tracked event in the last ${filters.days} days · Eastern Time`}
        actions={<Button variant="outline" onClick={exportCsv} disabled={!rows.length} id="exportEvents"><DownloadIcon /> Export CSV</Button>} />
      <Card>
        <CardHeader className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,20rem)_minmax(0,14rem)]">
          <div className="space-y-2"><Label htmlFor="eventCampaign">Campaign</Label>
            <Select value={campaign} onValueChange={setCampaign}>
              <SelectTrigger id="eventCampaign" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All campaigns & product events</SelectItem>{(campaigns.data || []).map(a => <SelectItem key={a.id} value={a.id}>{a.sponsor} · {a.id}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label htmlFor="eventCategory">Category</Label>
            <Select value={category} onValueChange={v => setCategory(v as typeof category)}>
              <SelectTrigger id="eventCategory" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {events.isPending ? <Skeleton className="h-64" /> : events.isError ? <ErrorState error={events.error} onRetry={() => events.refetch()} /> : rows.length ? (
            <Table id="eventTable">
              <TableHeader><TableRow><TableHead>Event</TableHead><TableHead className="text-right">Times recorded</TableHead><TableHead className="text-right">Unique installs</TableHead><TableHead className="text-right">Last recorded</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.map(r => (
                  <TableRow key={r.event}>
                    <TableCell className="whitespace-normal"><div className="font-medium">{info(r.event).label}</div><div className="text-xs text-muted-foreground">{info(r.event).description}</div></TableCell>
                    <TableCell className="tabular text-right">{num(r.occurrences)}</TableCell>
                    <TableCell className="tabular text-right">{num(r.installations)}</TableCell>
                    <TableCell className="text-right whitespace-normal text-muted-foreground">{dateTime(r.last_received)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : <EmptyState>No events recorded for these filters.</EmptyState>}
          <p className="mt-4 text-xs text-muted-foreground">Unique installs are anonymous app copies, not people. One install appears in several rows, so don’t add them together.</p>
        </CardContent>
      </Card>
    </div>
  );
}
