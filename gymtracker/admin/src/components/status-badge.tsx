import { Badge } from "@/components/ui/badge";
import type { CampaignStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

const STYLES: Record<CampaignStatus, string> = {
  live: "border-success/30 bg-success/10 text-success",
  scheduled: "border-chart-3/30 bg-chart-3/10 text-chart-3",
  paused: "border-warning/30 bg-warning/10 text-warning",
  ended: "text-muted-foreground",
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return <Badge variant="outline" className={cn("capitalize", STYLES[status])}>{status}</Badge>;
}
