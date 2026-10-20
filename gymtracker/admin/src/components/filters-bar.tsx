import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PERIODS, useFilters, type Period } from "@/lib/filters";

/** Global filters shown in the top bar; they apply to every page and to exported reports. */
export function FiltersBar() {
  const { filters, setFilters } = useFilters();
  return (
    <div className="flex items-center gap-3 sm:gap-5">
      <div className="flex items-center gap-2">
        <Switch id="excludeInternal" checked={filters.excludeInternal} onCheckedChange={checked => setFilters({ excludeInternal: checked })} />
        <Label htmlFor="excludeInternal" className="text-xs font-normal text-muted-foreground sm:text-sm">
          <span className="hidden sm:inline">Exclude internal installs</span><span className="sm:hidden">No internal</span>
        </Label>
      </div>
      <Select value={filters.days} onValueChange={value => setFilters({ days: value as Period })}>
        <SelectTrigger id="period" size="sm" className="w-[132px]" aria-label="Reporting period"><SelectValue /></SelectTrigger>
        <SelectContent align="end">
          {PERIODS.map(p => <SelectItem key={p} value={p}>Last {p} days</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
