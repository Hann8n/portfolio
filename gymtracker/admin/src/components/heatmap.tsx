import { hourLabel, num } from "@/lib/format";

const DAYS: [number, string, string][] = [[1, "Mon", "Monday"], [2, "Tue", "Tuesday"], [3, "Wed", "Wednesday"], [4, "Thu", "Thursday"], [5, "Fri", "Friday"], [6, "Sat", "Saturday"], [0, "Sun", "Sunday"]];

/** Weekday × hour grid. Scrolls inside its card on narrow screens instead of shrinking cells to nothing. */
export function Heatmap({ rows }: { rows: { dow: number; hour: number; sessions: number }[] }) {
  const grid = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  rows.forEach(r => { grid[r.dow][r.hour] = r.sessions; });
  const max = Math.max(0, ...grid.flat());
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full min-w-[520px] table-fixed border-separate border-spacing-[3px] text-[10px]">
        <caption className="sr-only">App visits by weekday and hour, Eastern Time</caption>
        <thead>
          <tr>
            <th className="w-9" scope="col"><span className="sr-only">Day</span></th>
            {Array.from({ length: 24 }, (_, h) => (
              <th key={h} scope="col" className="text-left font-normal whitespace-nowrap text-muted-foreground">
                {h % 3 === 0 ? hourLabel(h).replace(" ", "").toLowerCase() : <span className="sr-only">{hourLabel(h)}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map(([dow, short, long]) => (
            <tr key={dow}>
              <th scope="row" className="pr-1 text-left text-xs font-normal text-muted-foreground">{short}</th>
              {grid[dow].map((v, h) => (
                <td key={h} title={`${long} ${hourLabel(h)}: ${num(v)} visits`} className="h-5 rounded-[3px]"
                  style={{ backgroundColor: v && max ? `color-mix(in oklab, var(--chart-1) ${Math.round(18 + (v / max) * 82)}%, transparent)` : "var(--muted)" }}>
                  <span className="sr-only">{v}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** "34% of visits happen between 4 PM and 7 PM ET. Busiest day: Monday." */
export function timingInsight(rows: { dow: number; hour: number; sessions: number }[]) {
  const total = rows.reduce((sum, r) => sum + r.sessions, 0);
  if (!total) return null;
  const byHour = Array<number>(24).fill(0), byDay = Array<number>(7).fill(0);
  rows.forEach(r => { byHour[r.hour] += r.sessions; byDay[r.dow] += r.sessions; });
  const windowSum = (h: number) => byHour[h] + byHour[h + 1] + byHour[h + 2];
  let best = 0;
  for (let h = 1; h <= 21; h++) if (windowSum(h) > windowSum(best)) best = h;
  return { share: Math.round((windowSum(best) / total) * 100), from: hourLabel(best), to: hourLabel((best + 3) % 24), day: DAYS.find(d => d[0] === byDay.indexOf(Math.max(...byDay)))![2] };
}
