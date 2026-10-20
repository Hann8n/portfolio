import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

/**
 * Responsive bar chart on shadcn/ui charts (Recharts). Width follows the container; height is fixed per use.
 * `previous` draws a muted comparison bar per point.
 */
export function TimeBarChart({ data, label, previousLabel, height = 240, compact }: {
  data: { label: string; value: number; previous?: number; tooltip?: string }[];
  label: string; previousLabel?: string; height?: number; compact?: boolean;
}) {
  const hasPrevious = data.some(d => d.previous != null);
  const config: ChartConfig = {
    value: { label, color: "var(--chart-1)" },
    ...(hasPrevious ? { previous: { label: previousLabel || "Previous period", color: "var(--muted-foreground)" } } : {}),
  };
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
      <BarChart data={data} margin={{ left: 0, right: 4, top: 8 }} barGap={2}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={compact ? 12 : 24} interval="preserveStartEnd" />
        <YAxis tickLine={false} axisLine={false} width={36} allowDecimals={false} />
        <ChartTooltip cursor={{ fillOpacity: 0.4 }} content={<ChartTooltipContent labelFormatter={(value, payload) => payload?.[0]?.payload?.tooltip || value} />} />
        {hasPrevious && <Bar dataKey="previous" fill="var(--color-previous)" fillOpacity={0.35} radius={3} />}
        <Bar dataKey="value" fill="var(--color-value)" radius={3} />
      </BarChart>
    </ChartContainer>
  );
}
