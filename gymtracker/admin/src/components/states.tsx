import { AlertCircleIcon, RefreshCwIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <Card role="alert">
      <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <AlertCircleIcon className="size-5 shrink-0 text-destructive" />
        <p className="flex-1 text-sm">{error instanceof Error ? error.message : "Something went wrong."}</p>
        {onRetry && <Button variant="outline" size="sm" onClick={onRetry}><RefreshCwIcon /> Try again</Button>}
      </CardContent>
    </Card>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">{children}</p>;
}

export function LoadingGrid({ cards = 4, className = "h-28" }: { cards?: number; className?: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true" aria-label="Loading">
      {Array.from({ length: cards }, (_, i) => <Skeleton key={i} className={className} />)}
    </div>
  );
}
