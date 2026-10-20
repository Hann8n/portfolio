import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { change, num } from "@/lib/format";
import { cn } from "@/lib/utils";

export function DeltaBadge({ current, previous, days }: { current: number; previous: number | null | undefined; days: number }) {
  const delta = change(current, previous);
  if (!delta) return <Badge variant="outline" className="font-normal text-muted-foreground" title={`Comparison starts with ${days * 2} days of history`}>No prior period</Badge>;
  const up = delta.value > 0, down = delta.value < 0;
  return (
    <Badge variant="outline" title={`${num(previous)} in the previous ${days} days`}
      className={cn("tabular font-medium", up && "border-success/30 bg-success/10 text-success", down && "border-destructive/30 bg-destructive/10 text-destructive", !up && !down && "text-muted-foreground")}>
      {up && <ArrowUpRightIcon />}{down && <ArrowDownRightIcon />}{delta.label}
    </Badge>
  );
}
