import { num } from "@/lib/format";

/** Ranked horizontal bars (label · bar · value). Widths are relative to the largest value. */
export function BarList({ items, label }: { items: { name: string; value: number; display?: string; hint?: string }[]; label: string }) {
  const max = Math.max(1, ...items.map(i => i.value));
  return (
    <ul className="space-y-2.5 text-sm" aria-label={label}>
      {items.map(item => (
        <li key={item.name} className="grid grid-cols-[minmax(0,1fr)_minmax(3rem,1.4fr)_auto] items-center gap-3" title={item.hint}>
          <span className="truncate">{item.name}</span>
          <span className="h-2 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-chart-1" style={{ width: `${(item.value / max) * 100}%` }} /></span>
          <span className="tabular min-w-12 text-right text-muted-foreground">{item.display ?? num(item.value)}</span>
        </li>
      ))}
    </ul>
  );
}
