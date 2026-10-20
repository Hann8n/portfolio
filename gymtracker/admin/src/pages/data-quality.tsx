import { useState } from "react";
import { toast } from "sonner";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { EmptyState, ErrorState, LoadingGrid } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAudience, useSetInternal } from "@/lib/api";
import { dateTime, num, relativeTime } from "@/lib/format";

export function DataQualityPage() {
  const audience = useAudience();
  const setInternal = useSetInternal();
  const [marking, setMarking] = useState<{ id: string; label: string } | null>(null);
  const update = async (id: string, internal: boolean, label = "") => {
    try { await setInternal.mutateAsync({ id, internal, label }); toast.success(internal ? "Marked internal. Reports now exclude it." : "Included in reports again."); setMarking(null); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not save"); }
  };
  const data = audience.data;
  return (
    <div className="space-y-6">
      <PageHeader title="Data quality" description="Collection coverage, and the developer and test installs kept out of every figure." />
      {audience.isPending ? <LoadingGrid /> : audience.isError ? <ErrorState error={audience.error} onRetry={() => audience.refetch()} /> : data && (
        <>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <KpiCard label="Collecting since" value={<span className="text-xl sm:text-2xl">{data.coverage.since ? new Date(data.coverage.since).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" }) : "—"}</span>} help="First recorded event" />
            <KpiCard label="Latest event" value={<span className="text-xl sm:text-2xl">{relativeTime(data.coverage.latest)}</span>} help={dateTime(data.coverage.latest)} />
            <KpiCard label="Events · 24 hours" value={num(data.coverage.events_24h)} help={`${num(data.coverage.events)} retained`} />
            <KpiCard label="Internal installs" value={num(data.internal.length)} help="Excluded unless the filter is off" />
          </div>
          <Card>
            <CardHeader><CardTitle>Internal installs</CardTitle><CardDescription>Developer, TestFlight, and demo devices. Their raw events are kept; dashboards and sponsor reports leave them out.</CardDescription></CardHeader>
            <CardContent>
              {data.internal.length ? (
                <Table>
                  <TableHeader><TableRow><TableHead>Install</TableHead><TableHead className="text-right">Events</TableHead><TableHead className="text-right">Visits</TableHead><TableHead className="text-right">Last seen</TableHead><TableHead><span className="sr-only">Action</span></TableHead></TableRow></TableHeader>
                  <TableBody>{data.internal.map(row => (
                    <TableRow key={row.id}>
                      <TableCell className="whitespace-normal"><div className="font-medium">{row.label || "Internal install"}</div><div className="font-mono text-xs text-muted-foreground" title={row.id}>{row.id.slice(0, 8)}</div></TableCell>
                      <TableCell className="tabular text-right">{num(row.events)}</TableCell><TableCell className="tabular text-right">{num(row.sessions)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{relativeTime(row.last_seen)}</TableCell>
                      <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => update(row.id, false)} disabled={setInternal.isPending}>Include again</Button></TableCell>
                    </TableRow>))}
                  </TableBody>
                </Table>
              ) : <EmptyState>No installs are marked internal yet. Review the suggestions below.</EmptyState>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Suggested internal installs</CardTitle><CardDescription>Last 30 days, ranked by test-device signals. Signals are hints; confirm before excluding.</CardDescription></CardHeader>
            <CardContent>
              {data.candidates.length ? (
                <Table>
                  <TableHeader><TableRow><TableHead>Install</TableHead><TableHead>Signals</TableHead><TableHead className="text-right">Events</TableHead><TableHead className="text-right">Visits</TableHead><TableHead className="text-right">Builds</TableHead><TableHead><span className="sr-only">Action</span></TableHead></TableRow></TableHeader>
                  <TableBody>{data.candidates.map(row => (
                    <TableRow key={row.installation_id}>
                      <TableCell><div className="font-mono text-sm" title={row.installation_id}>{row.installation_id.slice(0, 8)}</div><div className="text-xs text-muted-foreground">{String(row.os_version || "").replace(/^Version /, "iOS ")}</div></TableCell>
                      <TableCell className="whitespace-normal"><div className="flex min-w-48 flex-wrap gap-1">{row.flags.map(f => <Badge key={f} variant="outline" className="border-warning/30 bg-warning/10 font-normal text-warning">{f}</Badge>)}</div></TableCell>
                      <TableCell className="tabular text-right">{num(row.events)}</TableCell><TableCell className="tabular text-right">{num(row.sessions)}</TableCell>
                      <TableCell className="tabular text-right">{row.build_list}</TableCell>
                      <TableCell className="text-right"><Button size="sm" onClick={() => setMarking({ id: row.installation_id, label: "" })}>Mark internal</Button></TableCell>
                    </TableRow>))}
                  </TableBody>
                </Table>
              ) : <EmptyState>No installs show test-device signals in the last 30 days.</EmptyState>}
            </CardContent>
          </Card>
        </>
      )}
      <Dialog open={!!marking} onOpenChange={open => !open && setMarking(null)}>
        <DialogContent>
          <form onSubmit={e => { e.preventDefault(); if (marking) update(marking.id, true, marking.label || "Internal device"); }} className="grid gap-4">
            <DialogHeader><DialogTitle>Mark as internal</DialogTitle><DialogDescription>Install <span className="font-mono">{marking?.id.slice(0, 8)}</span> will be excluded from every dashboard figure and sponsor report.</DialogDescription></DialogHeader>
            <div className="space-y-2"><Label htmlFor="installLabel">Label</Label><Input id="installLabel" autoFocus placeholder="Developer iPhone · TestFlight" value={marking?.label || ""} onChange={e => setMarking(m => m && { ...m, label: e.target.value })} /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setMarking(null)}>Cancel</Button><Button type="submit" disabled={setInternal.isPending}>Exclude install</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
