/**
 * Dependency-free SVG/HTML chart renderers for server-rendered, print-first documents (sponsor reports).
 * Hosts style the emitted classes. The admin app uses shadcn/ui charts instead.
 */
export interface ChartPoint { label: string; value: number; title?: string }
export interface BarChartOptions {
  ariaLabel: string; width?: number; height?: number;
  /** Values for a comparison series aligned by index, drawn as outlines behind the bars. */
  comparison?: (number | null)[];
  /** Print the value above each bar (best for 14 bars or fewer). */
  valueLabels?: boolean;
  /** Mark one bar index as highlighted. */
  highlight?: number;
  /** Print every non-empty label as given instead of thinning labels to fit. */
  explicitLabels?: boolean;
}

export function barChartSvg(points: ChartPoint[], options: BarChartOptions): string {
  const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
  const fmt = (value: number) => Math.round(value).toLocaleString("en-US");
  const width = options.width || 640, height = options.height || 200;
  const compare = options.comparison || [];
  const peak = Math.max(0, ...points.map(p => p.value), ...compare.map(v => v || 0));
  const raw = peak <= 0 ? 1 : peak;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map(s => s * magnitude).find(s => s * 4 >= raw) || magnitude * 10;
  const max = Math.max(step * Math.ceil(raw / step), peak < 4 ? 4 : 0);
  const left = 40, right = 6, top = options.valueLabels ? 18 : 10, bottom = 24;
  const plotH = height - top - bottom, plotW = width - left - right;
  const slot = plotW / Math.max(1, points.length);
  const barW = Math.max(2, Math.min(36, slot * 0.62));
  const y = (value: number) => top + plotH - (value / max) * plotH;
  const every = Math.max(1, Math.ceil(points.length / Math.max(1, Math.floor(plotW / 64))));
  let svg = `<svg class="chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(options.ariaLabel)}">`;
  for (const ratio of [0, 0.5, 1]) {
    const v = max * ratio, gy = y(v);
    svg += `<line class="chart-grid" x1="${left}" x2="${width - right}" y1="${gy}" y2="${gy}"/><text class="chart-axis" x="${left - 8}" y="${gy + 4}" text-anchor="end">${fmt(v)}</text>`;
  }
  points.forEach((p, i) => {
    const x = left + i * slot + (slot - barW) / 2;
    const prior = compare[i];
    if (prior != null && prior > 0) svg += `<rect class="chart-compare" x="${x}" y="${y(prior)}" width="${barW}" height="${top + plotH - y(prior)}"/>`;
    const h = top + plotH - y(p.value);
    svg += `<rect class="chart-bar${options.highlight === i ? " is-highlight" : ""}" x="${x}" y="${y(p.value)}" width="${barW}" height="${Math.max(p.value > 0 ? 1 : 0, h)}"><title>${esc(p.title || p.label + ": " + fmt(p.value))}</title></rect>`;
    if (options.valueLabels && p.value > 0) svg += `<text class="chart-value" x="${x + barW / 2}" y="${y(p.value) - 5}" text-anchor="middle">${fmt(p.value)}</text>`;
    if (options.explicitLabels ? p.label : i % every === 0 || (i === points.length - 1 && i % every >= every * 0.6)) {
      svg += `<text class="chart-axis" x="${left + (i + 0.5) * slot}" y="${height - 6}" text-anchor="middle">${esc(p.label)}</text>`;
    }
  });
  return svg + "</svg>";
}

export interface ShareRow { label: string; value: number; display?: string; title?: string }

/** Horizontal share bars as HTML; widths are relative to the largest value. */
export function shareBarsHtml(rows: ShareRow[], ariaLabel: string): string {
  const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
  const max = Math.max(1, ...rows.map(r => r.value));
  return `<div class="share-bars" role="list" aria-label="${esc(ariaLabel)}">` + rows.map(r =>
    `<div class="share-row" role="listitem"${r.title ? ` title="${esc(r.title)}"` : ""}><span class="share-label">${esc(r.label)}</span><span class="share-track"><span class="share-fill" style="width:${(r.value / max * 100).toFixed(1)}%"></span></span><span class="share-value">${esc(r.display ?? r.value.toLocaleString("en-US"))}</span></div>`
  ).join("") + "</div>";
}

