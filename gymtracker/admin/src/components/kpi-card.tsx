import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Headline metric. When `onSelect` is given the card is a toggle button that drives a chart. */
export function KpiCard({ label, value, delta, help, sparkline, selected, onSelect }: {
  label: string; value: ReactNode; delta?: ReactNode; help?: ReactNode; sparkline?: number[]; selected?: boolean; onSelect?: () => void;
}) {
  const body = (
    <CardContent className="flex h-full flex-col gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-end justify-between gap-2">
        <span className="tabular text-2xl font-semibold tracking-tight sm:text-3xl">{value}</span>
        {sparkline && sparkline.length > 1 && <Sparkline values={sparkline} />}
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">{delta}{help && <span>{help}</span>}</div>
    </CardContent>
  );
  if (!onSelect) return <Card className="py-4">{body}</Card>;
  return (
    <button type="button" aria-pressed={selected} onClick={onSelect} data-slot="card"
      className={cn("flex flex-col rounded-xl border bg-card py-4 text-left text-card-foreground shadow-sm transition-colors hover:border-ring/60 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none", selected && "border-chart-1 ring-1 ring-chart-1")}>
      {body}
    </button>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(1, ...values), w = 72, h = 24, step = w / (values.length - 1);
  const points = values.map((v, i) => `${(i * step).toFixed(1)},${(h - 2 - (v / max) * (h - 4)).toFixed(1)}`).join(" ");
  return <svg viewBox={`0 0 ${w} ${h}`} className="hidden h-6 w-[72px] shrink-0 overflow-visible sm:block" aria-hidden="true"><polyline points={points} fill="none" stroke="var(--chart-1)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" /></svg>;
}
